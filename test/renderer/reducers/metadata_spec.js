import { expect } from 'chai';

import * as constants from '../../../src/notebook/constants';

import { MetadataRecord } from '../../../src/notebook/records';
import * as commutable from 'commutable';
import { dummyCommutable } from '../dummy-nb';
import { List } from 'immutable';

import reducers from '../../../src/notebook/reducers';

const initialDocument = new Map();
const monocellDocument = initialDocument.set('notebook',
    commutable.appendCell(dummyCommutable, commutable.emptyCell));

describe('changeFilename', () => {
  it('returns the same originalState if filename is undefined', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
      })
    };

    const action = {
      type: constants.CHANGE_FILENAME,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.filename).to.equal('original.ipynb');
  });
  it('sets the filename if given a valid one', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
      })
    };
    
    const action = {
      type: constants.CHANGE_FILENAME,
      filename: 'test.ipynb',
    };

    const state = reducers(originalState, action);
    expect(state.metadata.filename).to.equal('test.ipynb');
  });
});

describe('setForwardCheckpoint', () => {
  it('adds the current document originalState to the future', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
    };

    const action = {
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.future.size).to.equal(1);
    expect(state.metadata.future.first()).to.deep.equal(monocellDocument);
  });
});

describe('setBackwardCheckpoint', () => {
  it('adds the current document originalState to the past', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
    };

    const action = {
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.past.size).to.equal(1);
    expect(state.metadata.past.first()).to.deep.equal(monocellDocument);
  });
  it('should clear the future if clearFuture is true', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(['a', 'b', 'c']),
      }),
    };

    const action = {
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: monocellDocument,
      clearFutureStack: true,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.past.size).to.equal(1);
    expect(state.metadata.future.size).to.equal(0);
  });
});

describe('clearFuture', () => {
  it('clears the future stack in the document originalState', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
    };

    const action = {
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: monocellDocument,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.future.size).to.equal(1);
    const clearedState = reducers(originalState, {type: constants.CLEAR_FUTURE});
    expect(clearedState.metadata.future.size).to.equal(0);
  });
});

describe('undo', () => {
  it('should do nothing if there is nothing in the past stack', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
      document: monocellDocument,
    };

    const action = {
      type: constants.UNDO,
    };

    const state = reducers(originalState, action);
    expect(state.document).to.deep.equal(originalState.document);
  });
  it('should trim the past stack and return the undone value', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List([monocellDocument]),
        future: new List(),
      }),
    };

    const action = {
      type: constants.UNDO,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.past.size).to.equal(0);
  });
});

describe('redo', () => {
  it('should do nothing if there is nothing in the future stack', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
      document: monocellDocument,
    };

    const action = {
      type: constants.REDO
    };

    const state = reducers(originalState, action);
    expect(state.document).to.deep.equal(originalState.document);
  });
  it('should trim the past stack and return the undone value', () => {
    const originalState = {
      metadata: new MetadataRecord({
        filename: 'original.ipynb',
        past: new List(),
        future: new List(),
      }),
      document: monocellDocument,
    };

    const action = {
      type: constants.REDO,
    };

    const state = reducers(originalState, action);
    expect(state.metadata.future.size).to.equal(0);
  });
});
