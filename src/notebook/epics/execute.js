import {
  createMessage,
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

/**
 * Create an object that adheres to the jupyter notebook specification.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html
 *
 * @param {Object} msg - Blank message.
 * @return {Object} formattedMsg  - Message with the associated output type
 */
export function msgSpecToNotebookFormat(msg) {
  return Object.assign({}, msg.content, {
    output_type: msg.header.msg_type,
  });
}

/**
 * Insert the content requisite for a code request to a kernel message.
 *
 * @param {String} code - Code to be executed in a message to the kernel.
 * @return {Object} msg - Message object containing the code to be sent.
 */
export function createExecuteRequest(code) {
  const executeRequest = createMessage('execute_request');
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false,
  };
  return executeRequest;
}

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Object} updated_outputs - Outputs + Output
 */
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

/**
 * Reads a payloadStream and inspects it for pager actions dispatched upon
 * specific cell executions.
 *
 * @param {String} id - Universally Unique ID of the cell message.
 * @param {Observable} payloadStream - Stream containing messages from the
 * kernel.
 * @return {Observable} pagerActionStream - Observable stream containing
 * Pager actions.
 */
export function createPagerActions(id, payloadStream) {
  return payloadStream.filter(p => p.source === 'page')
    .scan((acc, pd) => acc.push(Immutable.fromJS(pd)), new Immutable.List())
    .map((pagerDatas) => updateCellPagers(id, pagerDatas));
}

/**
 * Insert a create source update action into a group of messages.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving
 * messages.
 * @param {Observable} setInputStream - Maybe rename this to something more indicative?
 * @return {Observable} updateSourceStream - Stream of updateCellSource actions.
 */
export function createSourceUpdateAction(id, setInputStream) {
  return setInputStream.filter(x => x.replace)
    .pluck('text')
    .map(text => updateCellSource(id, text));
}

/**
 * Insert a create cell after action into a group of messages.
 *
 * @param {String} id -  Universally Unique Identifier of cell to have a cell
 * created after it.
 * @param {Object} setInputStream - Stream that contains a subset of messages
 * from the kernel that instruct the frontend what it should do.
 * @return {Object} updated_outputs -
 */
export function createCellAfterAction(id, setInputStream) {
  return setInputStream.filter(x => !x.replace)
    .pluck('text')
    .map((text) => createCellAfter('code', id, text));
}

/**
 * Insert a create cell status action into a group of messages.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving
 * an update in cell status.
 * @param {Object} cellMessages - Messages to receive create cell status action.
 * @return {Object} updatedCellMessages - Updated messages.
 */
export function createCellStatusAction(id, cellMessages) {
  return cellMessages.ofMessageType(['status'])
    .pluck('content', 'execution_state')
    .map(status => updateCellStatus(id, status));
}

/**
 * Cells are numbered according to the order in which they were executed.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html#execution-counter-prompt-number
 * This code updates the cell numbering on the frontend.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving an
 * update to the execution count.
 * @param {Object} cellMessages - Nessages to receive updates.
 * @return {Object} cellMessages - Updated messages.
 */
export function updateCellNumberingAction(id, cellMessages) {
  return cellMessages.ofMessageType(['execute_input'])
    .pluck('content', 'execution_count')
    .first()
    .map(ct => updateCellExecutionCount(id, ct));
}

/**
 * If a message is formattable, give it the notebook format specification and
 * reduce outputs.
 *
 * @param {String} id - Universally Unique Identifier of cell receiving
 * messages.
 * @param {Object} cellMessages - Set of sent cell messages.
 * @return {Object} cellMessages - Set of updated cell messages.
 */
export function handleFormattableMessages(id, cellMessages) {
  return cellMessages
    .ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
    .map(msgSpecToNotebookFormat)
    // Iteratively reduce on the outputs
    .scan(reduceOutputs, emptyOutputs)
    // Update the outputs with each change
    .map(outputs => updateCellOutputs(id, outputs));
}

/**
 * Creates an observable containing information requisite to lead
 * to the execution of a cell in the kernel.
 *
 * @param {Object} channels - The standard channels specified in the Jupyter
 * specification.
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {String} code - Source code to be executed.
 * @return {Observable} updated_outputs - Observable containing information
 * requisite to lead to the execution of a cell in the kernel.
 */
export function executeCellObservable(channels, id, code) {
  if (!channels || !channels.iopub || !channels.shell) {
    return Rx.Observable.throw(new Error('kernel not connected'));
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

  const cellAction$ = Rx.Observable.merge(
    // Inline %load
    createSourceUpdateAction(id, setInputStream),
    // %load for the cell _after_
    createCellAfterAction(id, setInputStream),
    // Clear any old pager
    Rx.Observable.of(updateCellPagers(id, new Immutable.List())),
    // Update the doc/pager section with new bundles
    createPagerActions(id, payloadStream),
    // Set the cell status
    createCellStatusAction(id, cellMessages),
    // Update the input numbering: `[ ]`
    updateCellNumberingAction(id, cellMessages),
    // Clear cell outputs
    Rx.Observable.of(updateCellOutputs(id, new Immutable.List())),
    // Handle all nbformattable messages
    handleFormattableMessages(id, cellMessages),
  );

  // On subscription, send the message
  return Rx.Observable.create(observer => {
    const subscription = cellAction$.subscribe(observer);
    channels.shell.next(executeRequest);
    return subscription;
  });
}

export const EXECUTE_CELL = 'EXECUTE_CELL';

/**
 * Execute Cell action.
 *
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {Object} source - Source code to executed.
 * @return {Object} executeCellAction - Action to be dispatched to reducer.
 */
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
    .catch(error =>
      Rx.Observable.of({
        type: ERROR_EXECUTING,
        payload: error,
        error: true,
      })
    );
}
