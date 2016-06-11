import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import reducers from '../../../src/notebook/reducers';

import { dummyCommutable } from '../dummy-nb';
import * as commutable from 'commutable';
import { Map, List } from 'immutable';

const initialDocument = new Map();
const monocellDocument = initialDocument.set('notebook',
    commutable.appendCell(dummyCommutable, commutable.emptyCell));


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

describe('setForwardCheckpoint', () => {
  it('adds the current document state to the future', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const newState = reducers(state, {type: constants.SET_FORWARD_CHECKPOINT, documentState: monocellDocument});
    expect(newState.app.future.size).to.equal(1);
    expect(newState.app.future.first()).to.deep.equal(monocellDocument);
  });
});

describe('setBackwardCheckpoint', () => {
  it('adds the current document state to the past', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const newState = reducers(state, {type: constants.SET_BACKWARD_CHECKPOINT, documentState: monocellDocument});
    expect(newState.app.past.size).to.equal(1);
    expect(newState.app.past.first()).to.deep.equal(monocellDocument);
  });
});

describe('clearFuture', () => {
  it('clears the future stack in the document state', () => {
    const state = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const newState = reducers(state, {type: constants.SET_FORWARD_CHECKPOINT, documentState: monocellDocument});
    expect(newState.app.future.size).to.equal(1);
    const clearedState = reducers(state, {type: constants.CLEAR_FUTURE});
    expect(clearedState.app.future.size).to.equal(0);
  });
});
