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
  it('adds the current document originalState to the future', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const action = {
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.app.future.size).to.equal(1);
    expect(state.app.future.first()).to.deep.equal(monocellDocument);
  });
});

describe('setBackwardCheckpoint', () => {
  it('adds the current document originalState to the past', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const action = {
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.app.past.size).to.equal(1);
    expect(state.app.past.first()).to.deep.equal(monocellDocument);
  });
  it('should clear the future if clearFuture is true', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(['a', 'b', 'c']),
      }
    };

    const action = {
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: monocellDocument,
      clearFutureStack: true,
    };

    const state = reducers(originalState, action);
    expect(state.app.past.size).to.equal(1);
    expect(state.app.future.size).to.equal(0);
  });
});

describe('clearFuture', () => {
  it('clears the future stack in the document originalState', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      }
    };

    const action = {
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.app.future.size).to.equal(1);
    const clearedState = reducers(originalState, {type: constants.CLEAR_FUTURE});
    expect(clearedState.app.future.size).to.equal(0);
  });
});

describe('undo', () => {
  it('should do nothing if there is nothing in the past stack', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      },
      document: monocellDocument
    };

    const action = {
      type: constants.UNDO,
    };

    const state = reducers(originalState, action);
    expect(state.document).to.deep.equal(originalState.document);
  });
  it('should trim the past stack and return the undone value', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List([monocellDocument]),
        future: new List(),
      }
    };

    const action = {
      type: constants.UNDO,
    };

    const state = reducers(originalState, action);
    expect(state.app.past.size).to.equal(0);
    expect(state.app.undone).to.deep.equal(monocellDocument);
  });
});

describe('redo', () => {
  it('should do nothing if there is nothing in the future stack', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List(),
      },
      document: monocellDocument
    };

    const action = {
      type: constants.REDO
    };

    const state = reducers(originalState, action);
    expect(state.document).to.deep.equal(originalState.document);
  });
  it('should trim the past stack and return the undone value', () => {
    const originalState = {
      app: {
        channels: false,
        spawn: false,
        connectionFile: false,
        past: new List(),
        future: new List([monocellDocument]),
      }
    };

    const action = {
      type: constants.REDO,
    };

    const state = reducers(originalState, action);
    expect(state.app.future.size).to.equal(0);
    expect(state.app.redone).to.deep.equal(monocellDocument);
  });
});
