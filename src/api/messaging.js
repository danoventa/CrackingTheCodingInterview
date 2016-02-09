/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import * as uuid from 'uuid';

const Rx = require('@reactivex/rxjs');
const Observable = Rx.Observable;

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

/**
 * isChildOf filters out messages that don't have the parent header matching parentMessage
 * @param  {Object}  parentMessage Jupyter message protocol message
 * @return {Observable}               the resulting observable
 */
export function isChildOf(parentMessage) {
  const parentMessageID = parentMessage.header.msg_id;
  return Observable.create(subscriber => {
    // since we're in an arrow function `this` is from the outer scope.
    // save our inner subscription
    const subscription = this.subscribe(msg => {
      if(!msg.parent_header || !msg.parent_header.msg_id) {
        subscriber.error(new Error('no parent_header.msg_id on message'));
        return;
      }

      if (parentMessageID === msg.parent_header.msg_id) {
        subscriber.next(msg);
      }
    },
    // be sure to handle errors and completions as appropriate and
    // send them along
    err => subscriber.error(err),
    () => subscriber.complete());

    // to return now
    return subscription;
  });
}

export function isMessageType(messageTypes) {
  return Observable.create(subscriber => {
    // since we're in an arrow function `this` is from the outer scope.
    // save our inner subscription
    const subscription = this.subscribe(msg => {
      if(!msg.header || !msg.header.msg_type) {
        subscriber.error(new Error('no header.msg_type on message'));
        return;
      }

      if (messageTypes.indexOf(msg.header.msg_type) !== -1) {
        subscriber.next(msg);
      }
    },
    // be sure to handle errors and completions as appropriate and
    // send them along
    err => subscriber.error(err),
    () => subscriber.complete());

    // to return now
    return subscription;
  });
}

Observable.prototype.isChildOf = isChildOf;
Observable.prototype.isMessageType = isMessageType;
