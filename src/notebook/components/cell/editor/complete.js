import {
  createMessage,
} from '../../../kernel/messaging';

export default function codeCompletion(channels, cursor, code) {
  const cursorPos = cursor.ch;

  const message = createMessage('complete_request');
  message.content = {
    code,
    cursor_pos: cursorPos,
  };

  return {
    observable: channels.shell
      .childOf(message)
      .ofMessageType('complete_reply')
      .pluck('content')
      .first()
      .map(results => ({
        list: results.matches,
        from: {
          line: cursor.line,
          ch: results.cursor_start,
        },
        to: {
          line: cursor.line,
          ch: results.cursor_end,
        },
      }))
      .timeout(2000), // 4s
    message,
  };
}
