import {
  createMessage,
} from './index';

/**
 * Requests information about the running kernel
 *
 * http://jupyter-client.readthedocs.org/en/latest/messaging.html#kernel-info
 *
 * @param  {Object} channels    enchannel collection of subjects
 * @return {Promise}            A promise that resolves to a kernel_info_reply
 */
export default function kernelInfo(channels) {
  if (!channels || !channels.shell) {
    throw new Error('shell channel not available for sending kernel info request');
  }
  const { shell } = channels;

  const message = createMessage('kernel_info_request');

  const p = shell
    .childOf(message)
    .ofMessageType('kernel_info_reply')
    .pluck('content')
    .first()
    .toPromise();

  shell.next(message);
  return p;
}
