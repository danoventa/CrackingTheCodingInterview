import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import reducers from '../../../src/notebook/reducers';

import { Map, List } from 'immutable';

const setNotebook = reducers[constants.SET_NOTEBOOK];
const updateExecutionCount = reducers[constants.UPDATE_CELL_EXECUTION_COUNT];
const newCellAfter = reducers[constants.NEW_CELL_AFTER];

import Immutable from 'immutable';

import { AppRecord } from '../../../src/notebook/records';

describe('cleanupKernel', () => {
  it('nullifies entries for the kernel in originalState', () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false,
      })
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

describe('setNotificationSystem', () => {
  it('returns the same originalState if notificationSystem is undefined', () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false,
     })
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM
    };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).to.be.undefined;
  });
  it('sets the notificationSystem if given', () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false,
     })
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: "",
    };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).to.equal("");
  });
});
