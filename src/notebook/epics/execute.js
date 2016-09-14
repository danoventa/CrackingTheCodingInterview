import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../kernel/messaging';

import {
  createCellAfter,
  updateCellExecutionCount,
  updateCellSource,
  updateCellOutputs,
  updateCellPagers,
  updateCellStatus,
} from '../actions';

import {
  REMOVE_CELL,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
} from '../constants';

const Rx = require('rxjs/Rx');
const Immutable = require('immutable');

const emptyOutputs = new Immutable.List();


export function reduceOutputs(outputs, output) {
  if (output.output_type === 'clear_output') {
    return emptyOutputs;
  }

  // Naive implementation of kernel stream buffering
  // This should be broken out into a nice testable function
  if (outputs.size > 0 &&
      output.output_type === 'stream' &&
      typeof output.name !== 'undefined' &&
      outputs.last().get('output_type') === 'stream'
    ) {
    // Invariant: size > 0, outputs.last() exists
    if (outputs.last().get('name') === output.name) {
      return outputs.updateIn([outputs.size - 1, 'text'], text => text + output.text);
    }
    const nextToLast = outputs.butLast().last();
    if (nextToLast &&
        nextToLast.get('output_type') === 'stream' &&
        nextToLast.get('name') === output.name) {
      return outputs.updateIn([outputs.size - 2, 'text'], text => text + output.text);
    }
  }

  return outputs.push(Immutable.fromJS(output));
}

export function executeCellObservable(channels, id, code) {
  return Rx.Observable.create((subscriber) => {
    if (!channels || !channels.iopub || !channels.shell) {
      subscriber.error('kernel not connected');
      subscriber.complete();
      return () => {};
    }

    const { iopub, shell } = channels;

    const executeRequest = createExecuteRequest(code);

    const payloadStream = shell.childOf(executeRequest)
      .ofMessageType('execute_reply')
      .pluck('content', 'payload')
      .filter(Boolean)
      .flatMap(payloads => Rx.Observable.from(payloads));

    // Sets the next cell source
    const setInputStream = payloadStream
      .filter(payload => payload.source === 'set_next_input');

    // Messages that should affect the cell's output are both messages child
    // to the execution request and messages mapped to the cell (from widget
    // interaction, for example).
    const cellMessages = iopub
      .filter(msg =>
        executeRequest.header.msg_id === msg.parent_header.msg_id
      );


    const megaObservable = Rx.Observable.merge(
      setInputStream.filter(x => x.replace)
        .pluck('text')
        .map(text => updateCellSource(id, text)),
      setInputStream.filter(x => !x.replace)
        .pluck('text')
        .map((text) => createCellAfter('code', id, text)),
      // Update the doc/pager section, clearing it first
      Rx.Observable.of(updateCellPagers(id, new Immutable.List())),
      payloadStream.filter(p => p.source === 'page')
        .scan((acc, pd) => acc.push(Immutable.fromJS(pd)), new Immutable.List())
        .map((pagerDatas) => updateCellPagers(id, pagerDatas)),
      cellMessages
        .ofMessageType(['status'])
        .pluck('content', 'execution_state')
        .map(status => updateCellStatus(id, status)),
      // Update the input numbering: `[ ]`
      cellMessages.ofMessageType(['execute_input'])
        .pluck('content', 'execution_count')
        .first()
        .map(ct => updateCellExecutionCount(id, ct)),
      // Handle all nbformattable messages, clearing output first
      Rx.Observable.of(updateCellOutputs(id, new Immutable.List())),
      cellMessages
        .ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
        .map(msgSpecToNotebookFormat)
        // Iteratively reduce on the outputs
        .scan(reduceOutputs, emptyOutputs)
        // Update the outputs with each change
        .map(outputs => updateCellOutputs(id, outputs))
    );

    megaObservable.subscribe(action => subscriber.next(action));

    shell.next(executeRequest);
  });
}

export const EXECUTE_CELL = 'EXECUTE_CELL';

export function executeCell(id, source) {
  return {
    type: EXECUTE_CELL,
    id,
    source,
  };
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(action$, store) {
  return action$.ofType('EXECUTE_CELL')
    .do(action => {
      if (!action.id) {
        throw new Error('execute cell needs an id');
      }
      if (typeof action.source !== 'string') {
        throw new Error('execute cell needs source string');
      }
    })
    // Split stream by cell IDs
    .groupBy(action => action.id)
    // Work on each cell's stream
    .map(cellActionObservable =>
      cellActionObservable
        // When a new EXECUTE_CELL comes in with the current ID, we create a
        // a new observable and unsubscribe from the old one.
        .switchMap(({ source, id }) => {
          const state = store.getState();
          const channels = state.app.channels;

          const kernelConnected = channels &&
            !(state.app.executionState === 'starting' ||
              state.app.executionState === 'not connected');

          if (!kernelConnected) {
            // TODO: Switch this to dispatching an error
            state.app.notificationSystem.addNotification({
              title: 'Could not execute cell',
              message: 'The cell could not be executed because the kernel is not connected.',
              level: 'error',
            });
            return Rx.Observable.of(updateCellExecutionCount(id, undefined));
          }

          return executeCellObservable(channels, id, source)
            .takeUntil(action$.filter(laterAction => laterAction.id === id)
                              .ofType(ABORT_EXECUTION, REMOVE_CELL));
        })
    )
    // Bring back all the inner Observables into one stream
    .mergeAll()
    .catch(error => {
      console.error(error);
      console.log(error);
      console.log(error.stack);
      return Rx.Observable.of({
        type: ERROR_EXECUTING,
        payload: error,
        error: true,
      });
    });
}
