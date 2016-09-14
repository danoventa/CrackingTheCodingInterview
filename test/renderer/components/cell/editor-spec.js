import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';
import { dummyStore } from '../../../utils'

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Rx from 'rxjs/Rx';

import { createMessage, childOf, ofMessageType } from '../../../../src/notebook/kernel/messaging';

chai.use(sinonChai);

import Editor, { formChangeObject, pick } from '../../../../src/notebook/components/cell/editor';

describe('Editor', () => {
  it('handles code completion', (done) => {
    const store = dummyStore();
    const editorWrapper = mount(
      <Editor
        completion
      />,
      {
        context: { store }
      }
    );
    expect(editorWrapper).to.not.be.null;

    const callback = sinon.spy();

    const cursor = {
        line: 1,
        ch: 9,
    }
    const code = 'import thi';

    const sent = new Rx.Subject();
    const received = new Rx.Subject();

    const mockSocket = Rx.Subject.create(sent, received);

    const channels = {
      shell: mockSocket,
    }

    const {observable, message} = editorWrapper.instance().codeCompletion(channels, cursor, code);

    expect(message.content).to.deep.equal({
      code: 'import thi',
      cursor_pos: 9,
    });

    const response = createMessage('complete_reply');
    response.content = {
      matches: ['import this'],
      cursor_start: 9,
      cursor_end: 10, // Likely hokey values
    }
    response.parent_header = Object.assign({}, message.header);

    sent.next(message);

    observable.subscribe(
      msg => {
        expect(msg).to.deep.equal({
            from: { line: 1, ch: 9 },
            list: ["import this"],
            to: { ch: 10, line: 1 },
          });
      },
      err => { throw err },
      done
    );
    received.next(response);
  });
});

describe('formChangeObject', () => {
  it('translates arguments to a nice Object', () => {
    expect(formChangeObject(1,2)).to.deep.equal({cm: 1, change: 2});
  })
})

describe('pick', () => {
  it('plucks the codemirror handle', () => {
    // no clue what to call this
    const handle = {
      pick: sinon.spy(),
    }

    pick(null, handle);
    expect(handle.pick).to.have.been.called;
  })
})
