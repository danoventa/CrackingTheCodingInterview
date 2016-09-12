import * as comm from '../../../src/notebook/kernel/comm';
import { expect } from 'chai';

import { dummyStore } from '../../utils';

describe('getMessageData', () => {
  it('returns the data payload in a message', () => {
    const testMsg = {
      'content': {
        'comm_id': 'randomUUID',
        'data': {
          'test': 'payload',
        },
      },
    };

    expect(comm.getMessageData(testMsg)).to.have.property('test');
  });
});

describe('getCommTargetName', () => {
  it('returns the target_name in a message', () => {
    const testMsg = {
      'content': {
        'comm_id': 'randomUUID',
        'target_name': 'testTargetName',
        'data': {
          'test': 'payload',
        }
      }
    };

    expect(comm.getCommTargetName(testMsg)).to.equal('testTargetName');
  });
});

describe('commIdFilter', () => {
  it('should return a function', () => {
    const commIdFilter = comm.commIdFilter('randomUUID');

    expect((typeof commIdFilter)).to.equal('function');
  });
});

describe('getCommId', () => {
  it('returns the comm_id in a message', () => {
    const testMsg = {
      'content': {
        'comm_id': 'randomUUID',
        'data': {
          'test': 'payload',
        },
      },
    };

    expect(comm.getCommId(testMsg)).to.equal('randomUUID');
  });
});
