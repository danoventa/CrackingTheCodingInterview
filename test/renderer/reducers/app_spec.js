import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import reducers from '../../../src/notebook/reducers';

const setNotebook = reducers[constants.SET_NOTEBOOK];
const updateExecutionCount = reducers[constants.UPDATE_CELL_EXECUTION_COUNT];
const newCellAfter = reducers[constants.NEW_CELL_AFTER];

describe('cleanupKernel', () => {
  it('nullifies entries for the kernel in originalState', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
      }
    };

    const action = {
      type: constants.KILL_KERNEL,
    };

    const state = reducers(originalState, action); 
    expect(state.app.channels).to.be.null;
    expect(state.app.spawn).to.be.null;
    expect(state.app.connectionFile).to.be.null;
  });
});

describe('changeFilename', () => {
  it('returns the same originalState if filename is undefined', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
      }
    };

    const action = {
      type: constants.CHANGE_FILENAME,
    };

    const state = reducers(originalState, action);
    expect(state.app.filename).to.be.undefined;
  });
  it('sets the filename if given a valid one', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
     }
    };

    const action = {
      type: constants.CHANGE_FILENAME,
      filename: 'test.ipynb',
    };

    const state = reducers(originalState, action); 
    expect(state.app.filename).to.equal('test.ipynb');
  });
});

describe('setNotificationSystem', () => {
  it('returns the same originalState if notificationSystem is undefined', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
     }
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM
    };

    const state = reducers(originalState, action); 
    expect(state.app.notificationSystem).to.be.undefined;
  });
  it('sets the notificationSystem if given', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
     }
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: "",
    };

    const state = reducers(originalState, action); 
    expect(state.app.notificationSystem).to.equal("");
  });
});
