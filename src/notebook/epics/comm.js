import Rx from 'rxjs/Rx';

import {
  createMessage,
} from '../kernel/messaging';

export function createCommMessage(comm_id, data = {}) {
  return createMessage('comm_msg', { content: { comm_id, data } });
}

export function createCommCloseMessage(comm_id, data = {}) {
  return createMessage('comm_close', { content: { comm_id, data } });
}

/**
 * creates a comm open message
 * @param  {string} comm_id       uuid
 * @param  {string} target_name   comm handler
 * @param  {any} data             up to the target handler
 * @param  {string} target_module [Optional] used to select a module that is responsible for handling the target_name
 * @return {jmp.Message}          Message ready to send on the shell channel
 */
export function createCommOpenMessage(comm_id, target_name, data = {}, target_module) {
  return createMessage('comm_close', { content: { comm_id, target_name, data, target_module } });
}

export const commListenEpic = (action$, store) =>
  action$.ofType('NEW_KERNEL')
    // We have a new channel
    // TODO: Open comms will need to be deleted from state
    .switchMap(action =>
      action.channels.iopub
        .ofMessageType(['comm_open', 'comm_msg', 'comm_close'])
        // Group on the target_name (our "primary" key)
        .groupBy(msg => msg.content.target_name)
        .map(targetComm$ =>
          // Cancel target_name registrants here
          targetComm$.do(msg => {
            const state = store.getState();
            // If we don't have the matching target_name we need to close the comm
            if (!state.comms.hasIn(['targets', targetComm$.key])) {
              // Hey look, it's a side effect!
              action.channels.shell.next(createCommCloseMessage(msg.comm_id));
              // We don't get this comm_close message back on IOPub though - we'll
              // need to close this observable off or emit the comm_close internally
            }
          })
          // Group on the comm_id (our "secondary" key)
          .groupBy(msg => msg.content.comm_id)
        )
      // IDEA: It would be very cool if comm we return here is a subject that
      //       sends comm messages with the right comm_id already attached, so
      //       they can send comm_msg or comm_close directly
    )
    // We double grouped, so we double merge
    .mergeAll()
    .mergeAll()
    .map(msg => ({ type: 'COMM_GENERIC', msg }))
    .catch(error =>
      Rx.Observable.of({
        type: 'COMM_ERROR',
        payload: error,
        error: true,
      })
    );


// TODO: Close comms for which we don't have a matching target_name
