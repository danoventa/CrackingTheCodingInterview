/*
New in version 4.1.

Message spec 4.1 (IPython 2.0) added a messaging system for developers to add their own objects with Frontend and Kernel-side components, and allow them to communicate with each other. To do this, IPython adds a notion of a Comm, which exists on both sides, and can communicate in either direction.

These messages are fully symmetrical - both the Kernel and the Frontend can send each message, and no messages expect a reply. The Kernel listens for these messages on the Shell channel, and the Frontend listens for them on the IOPub channel.
*/

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
  action$.ofType(NEW_KERNEL)
    .switchMap(action => Observable.of(action.channels))
    // We have a new channel
    // TODO: Open comms will need to be deleted from state
    .map(channels => {
      const { iopub } = channels;

      const commOpens = iopub
        .ofMessageType('comm_open')
        .groupBy(msg => msg.content.target_name)
        .map(comm_open => { type: 'NEW_COMM', payload: commOpen })
        // Either we use store.getState() here to check to see if we need to
        // close the comm/register a new comm, or we dispatch the comm_open
        // which allows us to be a bit more dynamic

      /* Every Comm has an ID and a target name. The code handling the message on the receiving side is responsible for maintaining a mapping of target_name keys to constructors. After a comm_open message has been sent, there should be a corresponding Comm instance on both sides. The data key is always a dict and can be any extra JSON information used in initialization of the comm. */

      // Dispatch NEW_COMM
    });
