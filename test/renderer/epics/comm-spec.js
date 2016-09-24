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
    const commMessage = createCommCloseMessage('0000', { 'hey': 'is for horses' });

    expect(commMessage.content.data).to.deep.equal({ 'hey': 'is for horses' });
    expect(commMessage.content.comm_id).to.equal('0000');
    expect(commMessage.header.msg_type).to.equal('comm_close');
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
