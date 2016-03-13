import {
  createMessage,
} from './index';

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
