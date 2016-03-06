const Rx = require('@reactivex/rxjs');
const Immutable = require('immutable');

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../api/messaging';

import {
  updateCellExecutionCount,
  updateCellOutputs,
} from '../actions';

// Usage, assuming using Fluorine
// dispatch(executeCell(id,source)(channels))

export function executeCell(id, source) {
  return function executeCellOnChannels(channels) {
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
           .scan((outputs, output) => {
             if (output.output_type === 'clear_output') {
               return new Immutable.List();
             }
             return outputs.push(Immutable.fromJS(output));
           }, new Immutable.List())
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
  };
}
