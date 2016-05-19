import { expect } from 'chai';

import * as commutable from 'commutable';
import * as constants from '../../../src/notebook/constants';

import reducers from '../../../src/notebook/reducers';

import {
  dummyJSON,
  dummyCommutable,
} from '../dummy-nb';

import {
  fromJS,
} from 'commutable';

describe('setNotebook', () => {
  it('converts a JSON notebook to our commutable notebook and puts in state', () => {
    const state = reducers({}, { type: constants.SET_NOTEBOOK, data: fromJS(dummyJSON) });
    expect(state.document.notebook.get('nbformat')).to.equal(4);
  });
});

describe('updateExecutionCount', () => {
  it('updates the execution count by id', () => {
    const originalState = {
      document: {
        notebook: commutable.appendCell(dummyCommutable, commutable.emptyCodeCell),
      }
    };

    const id = originalState.document.notebook.get('cellOrder').last();

    const action = {
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id,
      count: 42,
    };

    const state = reducers(originalState, action);
    expect(state.document.notebook.getIn(['cellMap', id, 'execution_count'])).to.equal(42);
  });
});

describe('newCellAfter', () => {
  it('creates a brand new cell after the given id', () => {
    const originalState = {
      document: {
        notebook: commutable.appendCell(dummyCommutable, commutable.emptyCodeCell),
      }
    };
    const id = originalState.document.notebook.get('cellOrder').last();

    const action = {
      type: constants.NEW_CELL_AFTER,
      id,
      cellType: 'markdown',
    };

    const state = reducers(originalState, action);
    expect(state.document.notebook.get('cellOrder').size).to.equal(4);
    const cellID = state.document.notebook.get('cellOrder').last();
    const cell = state.document.notebook.getIn(['cellMap', cellID]);
    expect(cell.get('cell_type')).to.equal('markdown');
  });
});
