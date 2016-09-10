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
