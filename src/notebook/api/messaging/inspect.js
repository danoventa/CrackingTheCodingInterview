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

  return shell
    .childOf(message)
    .filter(msg => msg.header.msg_type === 'inspect_reply')
    .map(msg => msg.content)
    .first()
    .toPromse();
}
