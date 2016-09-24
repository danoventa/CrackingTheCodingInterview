const chai = require('chai');

const expect = chai.expect;

import { dummyStore } from '../../utils';

const Immutable = require('immutable');

const Rx = require('rxjs/Rx');

import {
  createCommMessage,
  createCommCloseMessage,
  createCommOpenMessage,
  targetNameKey,
  commIDKey,
  createCommErrorAction,
  commMessageToAction,
} from '../../../src/notebook/epics/comm';

describe('createCommMessage', () => {
  it('creates a comm_msg', () => {
    const commMessage = createCommMessage('0000', { 'hey': 'is for horses' });

    expect(commMessage.content.data).to.deep.equal({ 'hey': 'is for horses' });
    expect(commMessage.content.comm_id).to.equal('0000');
    expect(commMessage.header.msg_type).to.equal('comm_msg');
  });
});

describe('createCommOpenMessage', () => {
  it('creates a comm_open', () => {
    const commMessage = createCommOpenMessage('0001', 'myTarget', { 'hey': 'is for horses' });

    expect(commMessage.content).to.deep.equal({
      comm_id: '0001',
      target_name: 'myTarget',
      data: { 'hey': 'is for horses' },
    });
  });
  it('can specify a target_module', () => {
    const commMessage = createCommOpenMessage('0001', 'myTarget', { 'hey': 'is for horses' }, 'Dr. Pepper');

    expect(commMessage.content).to.deep.equal({
      comm_id: '0001',
      target_name: 'myTarget',
      data: { 'hey': 'is for horses' },
      target_module: 'Dr. Pepper',
    });
  });
});

describe('createCommCloseMessage', () => {
  it('creates a comm_msg', () => {
    const parent_header = { id: '23' };

    const commMessage = createCommCloseMessage(parent_header, '0000', { 'hey': 'is for horses' });

    expect(commMessage.content.data).to.deep.equal({ 'hey': 'is for horses' });
    expect(commMessage.content.comm_id).to.equal('0000');
    expect(commMessage.header.msg_type).to.equal('comm_close');
    expect(commMessage.parent_header).to.deep.equal(parent_header);
  });
});

describe('targetNameKey', () => {
  it('extracts target_name off a message', () => {
    expect(targetNameKey({ content: { target_name: 'Meow'} })).to.equal('Meow');
  })
})

describe('commIDKey', () => {
  it('extracts comm_id off a message', () => {
    expect(commIDKey({ content: { comm_id: '95032' } })).to.equal('95032');
  })
})

describe('createCommErrorAction', () => {
  it('creates a COMM_ERROR action with an error', () => {
    const err = new Error();
    return createCommErrorAction(err)
      .toPromise()
      .then(action => {
        expect(action.type).to.equal('COMM_ERROR');
        expect(action.payload).to.equal(err);
        expect(action.error).to.be.true;
      })
  })
})

describe('commMessageToAction', () => {
  it('creates the COMM_GENERIC action', () => {
    expect(commMessageToAction('hey')).to.deep.equal({ type: 'COMM_GENERIC', msg: 'hey' })
  })
})
