import { expect } from 'chai';

import {
  setExecutionState,
} from '../../../src/notebook/actions';

import * as constants from '../../../src/notebook/constants';

import createStore from '../../../src/notebook/store';

describe('setExecutionState', () => {
  it('creates a SET_EXECUTION_STATE action', () => {
    expect(setExecutionState('idle')).to.deep.equal({
      type: constants.SET_EXECUTION_STATE,
      executionState: 'idle',
    });
  })
});
