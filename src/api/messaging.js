/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import * as uuid from 'uuid';

const session = uuid.v4();

export function createMessage(msg_type) {
  const username = process.env.LOGNAME || process.env.USER ||
                   process.env.LNAME || process.env.USERNAME;
  return {
    header: {
      username,
      session,
      msg_type,
      msg_id: uuid.v4(),
      date: new Date(),
      version: '5.0',
    },
    metadata: {},
    parent_header: {},
    content: {},
  };
}

export function createExecuteRequest(code) {
  const executeRequest = createMessage('execute_request');
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false,
  };
  return executeRequest;
}
