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
  if (!channels || !channels.iopub || !channels.shell) {
    return {
      observable: Rx.Observable.throw(new Error('kernel not connected')),
      message: null,
    };
  }

  const executeRequest = createExecuteRequest(code);

  const { iopub, shell } = channels;

  // Payload streams in general
  const payloadStream = shell.childOf(executeRequest)
    .ofMessageType('execute_reply')
    .pluck('content', 'payload')
    .filter(Boolean)
    .flatMap(payloads => Rx.Observable.from(payloads));

  // Payload stream for setting the input, whether in place or "next"
  const setInputStream = payloadStream
    .filter(payload => payload.source === 'set_next_input');

  // All child messages for the cell
  const cellMessages = iopub
    .filter(msg =>
      executeRequest.header.msg_id === msg.parent_header.msg_id
    );

  const megaObservable = Rx.Observable.merge(
    // Inline %load
    setInputStream.filter(x => x.replace)
      .pluck('text')
      .map(text => updateCellSource(id, text)),
    // %load for the cell _after_
    setInputStream.filter(x => !x.replace)
      .pluck('text')
      .map((text) => createCellAfter('code', id, text)),
    // Clear any old pager
    Rx.Observable.of(updateCellPagers(id, new Immutable.List())),
    // Update the doc/pager section with new bundles
    payloadStream.filter(p => p.source === 'page')
      .scan((acc, pd) => acc.push(Immutable.fromJS(pd)), new Immutable.List())
      .map((pagerDatas) => updateCellPagers(id, pagerDatas)),
    // Set the cell status
    cellMessages.ofMessageType(['status'])
      .pluck('content', 'execution_state')
      .map(status => updateCellStatus(id, status)),
    // Update the input numbering: `[ ]`
    cellMessages.ofMessageType(['execute_input'])
      .pluck('content', 'execution_count')
      .first()
      .map(ct => updateCellExecutionCount(id, ct)),
    // Clear cell outputs
    Rx.Observable.of(updateCellOutputs(id, new Immutable.List())),
    // Handle all nbformattable messages
    cellMessages.ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
      .map(msgSpecToNotebookFormat)
      // Iteratively reduce on the outputs
      .scan(reduceOutputs, emptyOutputs)
      // Update the outputs with each change
      .map(outputs => updateCellOutputs(id, outputs))
  );

  return {
    observable: megaObservable,
    message: executeRequest,
  };
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

          const { observable, message } = executeCellObservable(channels, id, source);

          // TODO: Where do I defer this? I need it done after subscription...
          channels.shell.next(message);

          return observable
            .takeUntil(action$.filter(laterAction => laterAction.id === id)
                              .ofType(ABORT_EXECUTION, REMOVE_CELL));
        })
    )
    // Bring back all the inner Observables into one stream
    .mergeAll()
    .catch(error =>
      Rx.Observable.of({
        type: ERROR_EXECUTING,
        payload: error,
        error: true,
      })
    );
}
