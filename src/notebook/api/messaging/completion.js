import {
  createMessage,
} from './index';

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
