import {
  createMessage,
} from './index';

/**
 * Request introspection of code via the jupyter messaging protocol.
 *
 * http://jupyter-client.readthedocs.org/en/latest/messaging.html#introspection
 *
 *   Code can be inspected to show useful information to the user. It is up to the
 *   Kernel to decide what information should be displayed, and its formatting.
 *
 * @param  {Object} channels    enchannel collection of subjects
 * @param  {string} code        The code context in which introspection is
 *                              requested. This may be up to an entire multiline
 *                              cell.
 * @param  {number} cursorPos   The cursor position within 'code' (in unicode
 *                              characters) where inspection is requested.
 * @param  {number} detailLevel In IPython, the default (0) is equivalent to
 *                              typing 'x?' at the prompt, 1 is equivalent to
 *                              'x??'. The difference is up to kernels. In
 *                              IPython level 1 includes the source code if
 *                              available.
 * @return {Promise}            A promise that resolves to an inspect_reply,
 *                              which has the format:
 *                              	{
 *                              		status: 'ok' || 'error',
 *                              	  found: Boolean,
 *                              	  data: Mimebundle (for transformime)
 *                              	  metadata: {}
 *                                }
 */
export default function inspect(channels, code, cursorPos, detailLevel = 0) {
  if (!channels || !channels.shell) {
    throw new Error('shell channel not available for sending inspect request');
  }
  const { shell } = channels;

  const message = createMessage('inspect_request');
  message.content = {
    code,
    cursor_pos: cursorPos,
    detail_level: detailLevel,
  };

  const p = shell
    .childOf(message)
    .ofMessageType('inspect_reply')
    .pluck('content')
    .first()
    .toPromise();

  shell.next(message);
  return p;
}
