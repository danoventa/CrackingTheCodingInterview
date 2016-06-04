import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import reducers from '../../../src/notebook/reducers';

const setNotebook = reducers[constants.SET_NOTEBOOK];
const updateExecutionCount = reducers[constants.UPDATE_CELL_EXECUTION_COUNT];
const newCellAfter = reducers[constants.NEW_CELL_AFTER];

describe('cleanupKernel', () => {
  it('nullifies entries for the kernel in state', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
      }
    };
    const newState = reducers(state, { type: constants.KILL_KERNEL});
    expect(newState.app.channels).to.be.null;
    expect(newState.app.spawn).to.be.null;
    expect(newState.app.connectionFile).to.be.null;
  });
});

describe('changeFilename', () => {
  it('returns the same state if filename is undefined', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
      }
    };
    const newState = reducers(state, {type: constants.CHANGE_FILENAME});
    expect(newState.app.filename).to.be.undefined;
  });
  it('sets the filename if given a valid one', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
     }
    };
    const newState = reducers(state, {type: constants.CHANGE_FILENAME, filename: 'test.ipynb'});
    expect(newState.app.filename).to.equal('test.ipynb');
  });
});
