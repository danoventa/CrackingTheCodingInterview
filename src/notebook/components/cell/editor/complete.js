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

export function codeComplete(channels, editor) {
  const cursor = editor.getCursor();
  const cursorPos = editor.indexFromPos(cursor);
  const code = editor.getValue();

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
        from: editor.posFromIndex(results.cursor_start),
        to: editor.posFromIndex(results.cursor_end),
      }))
      .timeout(2000), // 4s
    message,
  };
}
