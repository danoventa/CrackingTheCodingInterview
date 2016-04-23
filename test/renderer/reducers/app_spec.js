import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import { reducers } from '../../../src/notebook/reducers';

const setNotebook = reducers[constants.SET_NOTEBOOK];
const updateExecutionCount = reducers[constants.UPDATE_CELL_EXECUTION_COUNT];
const newCellAfter = reducers[constants.NEW_CELL_AFTER];

describe('cleanupKernel', () => {
  it('nullifies entries for the kernel in state', () => {
    const state = {
      channels: false,
      spawn: false,
      connectionFile: false,
    };
    const newState = reducers[constants.KILL_KERNEL](state);
    expect(newState.channels).to.be.null;
    expect(newState.spawn).to.be.null;
    expect(newState.connectionFile).to.be.null;
  });
});
