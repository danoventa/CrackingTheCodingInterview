import {
  createMessage,
} from '../../../kernel/messaging';

// Hint picker
export const pick = (cm, handle) => handle.pick();

export function formChangeObject(cm, change) {
  return {
    cm,
    change,
  };
}

export function codeComplete(channels, cursorPos, line, code) {
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
          line,
          ch: results.cursor_start,
        },
        to: {
          line,
          ch: results.cursor_end,
        },
      }))
      .timeout(2000), // 4s
    message,
  };
}
