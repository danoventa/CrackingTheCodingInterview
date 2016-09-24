/*
New in version 4.1.

Message spec 4.1 (IPython 2.0) added a messaging system for developers to add their own objects with Frontend and Kernel-side components, and allow them to communicate with each other. To do this, IPython adds a notion of a Comm, which exists on both sides, and can communicate in either direction.

These messages are fully symmetrical - both the Kernel and the Frontend can send each message, and no messages expect a reply. The Kernel listens for these messages on the Shell channel, and the Frontend listens for them on the IOPub channel.
*/

import Rx from 'rxjs/Rx';

export function createCommMessage(comm_id, data) {
  return createMessage('comm_msg', { content: { comm_id, data } });
}

export function createCommCloseMessage(comm_id, data) {
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
export function createCommOpenMessage(comm_id, target_name, data, target_module) {
  return createMessage('comm_close', { content: { comm_id, target_name, data, target_module } });
}

export const commListenEpic = (action$, store) =>
  action$.ofType('NEW_KERNEL')
    .switchMap(action => Rx.Observable.of(action.channels))
    // We have a new channel
    // TODO: Open comms will need to be deleted from state
    .map(channels =>
      channels.iopub
        .ofMessageType(['comm_open', 'comm_msg', 'comm_close'])
        .do(x => console.warn(x.content.data))
        .do(x => console.warn(x))
        .groupBy(msg => msg.content.comm_id)
        .map(comm$ => ({ type: 'NEW_COMM', comm$, id: comm$.key }))
      // IDEA: It would be very cool if comm we return here is a subject that
      //       sends comm messages with the right comm_id already attached, so
      //       they can send comm_msg or comm_close directly
    )
    .mergeAll();


// TODO: Close comms for which we don't have a matching target_name
