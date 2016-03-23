const Rx = require('@reactivex/rxjs');
const Immutable = require('immutable');

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
  createMessage,
} from '../api/messaging';

import {
  updateCellExecutionCount,
  updateCellOutputs,
  setLanguageInfo,
} from '../actions';

export function acquireKernelInfo(channels) {
  const { shell } = channels;

  const message = createMessage('kernel_info_request');

  const obs = shell
    .childOf(message)
    .ofMessageType('kernel_info_reply')
    .first()
    .pluck('content', 'language_info')
    .map(setLanguageInfo)
    .publishReplay(1)
    .refCount();

  shell.next(message);
  return obs;
}

const emptyOutputs = new Immutable.List();

function reduceOutputs(outputs, output) {
  if (output.output_type === 'clear_output') {
    return emptyOutputs;
  }

  // Naive implementation of stream buffering
  // This should be broken out into a nice testable function
  // Additionally, stdout and stderr should be in order as stdout followed
  // by stderr, as implemented in the Jupyter notebook
  if (output.output_type === 'stream') {
    const last = outputs.last();
    if (last && last.get('name') === output.name) {
      return outputs.updateIn([outputs.size - 1, 'text'], text => text + output.text);
    }
    const nextToLast = outputs.butLast().last();
    if (nextToLast && nextToLast.get('name') === output.name) {
      return outputs.updateIn([outputs.size - 2, 'text'], text => text + output.text);
    }
  }

  return outputs.push(Immutable.fromJS(output));
}

export function executeCell(channels, id, source) {
  return Rx.Observable.create((subscriber) => {
    if (!channels || !channels.iopub || !channels.shell) {
      subscriber.error('kernel not connected');
      subscriber.complete();
      return () => {};
    }

    const { iopub, shell } = channels;

    // Track all of our subscriptions for full disposal
    const subscriptions = [];

    const executeRequest = createExecuteRequest(source);

    // Limitation of the Subject implementation in enchannel
    // we must shell.subscribe in order to shell.next
    subscriptions.push(shell.subscribe(() => {}));

    // Set the current outputs to an empty list
    subscriber.next(updateCellOutputs(id, new Immutable.List()));

    const childMessages = iopub.childOf(executeRequest)
                               .share();

    subscriptions.push(
      childMessages.ofMessageType(['execute_input'])
                 .pluck('content', 'execution_count')
                 .first()
                 .subscribe((ct) => {
                   subscriber.next(updateCellExecutionCount(id, ct));
                 })
    );

    // Handle all the nbformattable messages
    subscriptions.push(childMessages
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
         .map(msgSpecToNotebookFormat)
         // Iteratively reduce on the outputs
         .scan(reduceOutputs, emptyOutputs)
         // Update the outputs with each change
         .subscribe(outputs => {
           subscriber.next(updateCellOutputs(id, outputs));
         })
    );

    shell.next(executeRequest);

    return function executionDisposed() {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  });
}
