import {
  createMessage,
} from './index';

/**
 * Request completion hints from the kernel
 *
 * http://jupyter-client.readthedocs.org/en/latest/messaging.html#completion
 *
 * @param  {Object} channels    enchannel collection of subjects
 * @param  {string} code        The code context. This may be up to an entire multiline
 *                              cell.
 * @param  {number} cursorPos   The cursor position within 'code' (in unicode
 *                              characters) where completion is requested.
 * @return {Promise}            A promise that resolves to a complete_reply,
 *                              which has the format:
 *
 *                              	{
 *                              		status: 'ok' || 'error',
 *                              	  matches: Array,
 *                              	  cursor_start: number,
 *                              	  cursor_end: number,
 *                              	  metadata: {}
 *                                }
 */
export default function complete(channels, code, cursorPos) {
  if (!channels || !channels.shell) {
    throw new Error('shell channel not available for sending completion request');
  }
  const { shell } = channels;

  const message = createMessage('complete_request');
  message.content = {
    code,
    cursor_pos: cursorPos,
  };

  const p = shell
    .childOf(message)
    .ofMessageType('complete_reply')
    .pluck('content')
    .first()
    .toPromise();

  shell.next(message);
  return p;
}
