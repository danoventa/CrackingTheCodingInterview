import {
  createMessage,
} from '../api/messaging';

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
    .map(msg => msg.content)
    .first()
    .toPromse();
  shell.send(message);
  return p;
}
