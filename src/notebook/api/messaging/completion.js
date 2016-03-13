import {
  createMessage,
} from '../api/messaging';

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

  return shell
    .childOf(message)
    .ofMessageType('complete_reply')
    .map(msg => msg.content)
    .first()
    .toPromse();
}
