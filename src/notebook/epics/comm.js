import Rx from 'rxjs/Rx';

import {
  createMessage,
} from '../kernel/messaging';

/**
 * creates a comm open message
 * @param  {string} comm_id       uuid
 * @param  {string} target_name   comm handler
 * @param  {any} data             up to the target handler
 * @param  {string} target_module [Optional] used to select a module that is responsible for handling the target_name
 * @return {jmp.Message}          Message ready to send on the shell channel
 */
export function createCommOpenMessage(comm_id, target_name, data = {}, target_module) {
  const msg = createMessage('comm_open', { content: { comm_id, target_name, data } });
  if (target_module) {
    msg.content.target_module = target_module;
  }
  return msg;
}

// TODO: buffer/blob handling on comm messages
export function createCommMessage(comm_id, data = {}) {
  return createMessage('comm_msg', { content: { comm_id, data } });
}

export function createCommCloseMessage(parent_header, comm_id, data = {}) {
  return createMessage('comm_close', { content: { comm_id, data }, parent_header });
}

// Pluck off the target_name as a key for groupBy
export const targetNameKey = (msg) => msg.content.target_name;
// Pluck off the comm_id as a key for groupBy
export const commIDKey = (msg) => msg.content.comm_id;

export const createCommErrorAction = (error) =>
  Rx.Observable.of({
    type: 'COMM_ERROR',
    payload: error,
    error: true,
  });

// TODO: Only leaving this in for prototyping
export const commMessageToAction = (msg) => ({ type: 'COMM_GENERIC', msg });

export const commListenEpic = (action$, store) =>
  action$.ofType('NEW_KERNEL')
    // We have a new channel
    .switchMap(action =>
      action.channels.iopub
        .ofMessageType(['comm_open', 'comm_msg', 'comm_close'])
        // Group on the target_name (our "primary" key)
        .groupBy(targetNameKey)
        .map(targetComm$ =>
          // Cancel target_name registrants here
          targetComm$.do(msg => {
            const state = store.getState();
            // If we don't have the matching target_name we need to close the comm
            if (!state.comms.hasIn(['targets', targetComm$.key])) {
              // Hey look, it's a side effect!
              action.channels.shell.next(createCommCloseMessage(msg.header, msg.comm_id));
              // TODO: We don't get this comm_close message back on IOPub though - we'll
              // need to close this observable off or emit the comm_close internally
              // Likely want to have a setup that returns either an Observable
              // with just the one message or a merge of just the one + the close message
            }
          })
          // Group on the comm_id (our "secondary" key)
          .groupBy(commIDKey)
        )
      // IDEA: It would be very cool if comm we return here is a subject that
      //       sends comm messages with the right comm_id already attached, so
      //       they can send comm_msg or comm_close directly
    )
    // We double grouped, so we double merge
    .mergeAll()
    .mergeAll()
    // TODO: Something useful with the comms
    .map(commMessageToAction)
    .catch(createCommErrorAction);
