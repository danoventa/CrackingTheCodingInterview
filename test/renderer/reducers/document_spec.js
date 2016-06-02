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

import {
  List,
  Map,
} from 'immutable';

const initialDocument = new Map();
const monocellDocument = initialDocument.set('notebook', commutable.appendCell(dummyCommutable, commutable.emptyCodeCell));

describe('setNotebook', () => {
  it('converts a JSON notebook to our commutable notebook and puts in state', () => {
    const initialState = {
      app: null,
      document: initialDocument,
    };
    const data = fromJS(dummyJSON);
    const state = reducers(initialState, { type: constants.SET_NOTEBOOK, data });
    expect(state.document.getIn(['notebook', 'nbformat'])).to.equal(4);
  });
});

describe('focusCell', () => {
  it('should set focusedCell to the appropriate cell ID', () => {
    const originalState = {
      document: monocellDocument,
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.FOCUS_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.get('focusedCell')).to.equal(id);
  });
});


describe('focusNextCell', () => {
  it('should focus the next cell if not the last cell', () => {
    const originalState = {
      document: monocellDocument,
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.get('focusedCell')).to.not.be.null;
  });
  it('should create and focus a new cell if last cell', () => {
    const originalState = {
      document: monocellDocument,
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.get('focusedCell')).to.not.be.null;
    expect(state.document.getIn(['notebook', 'cellOrder']).size).to.equal(3);
  });
});

describe('focusPreviousCell', () => {
  it('should focus the previous cell', () => {
    const originalState = {
      document: initialDocument.set('notebook', dummyCommutable),
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();
    const previousId = originalState.document.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.FOCUS_PREVIOUS_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.get('focusedCell')).to.equal(previousId);
  });
});

describe('updateExecutionCount', () => {
  it('updates the execution count by id', () => {
    const originalState = {
      document: monocellDocument,
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id,
      count: 42,
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellMap', id, 'execution_count'])).to.equal(42);
  });
});

describe('moveCell', () => {
  it('should swap the first and last cell appropriately', () => {
    const originalState = {
      document: initialDocument.set('notebook', dummyCommutable),
    };

    const cellOrder = originalState.document.getIn(['notebook', 'cellOrder']);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();

    const action = {
      type: constants.MOVE_CELL,
      id,
      destinationId,
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellOrder']).last()).to.equal(id);
    expect(state.document.getIn(['notebook', 'cellOrder']).first()).to.equal(destinationId);
  });
});

describe('clearCellOutput', () => {
  it('should clear outputs list', () => {
    const originalState = {
      document: initialDocument.set('notebook',
        commutable.appendCell(dummyCommutable,
          commutable.emptyCodeCell.set('outputs', ['dummy outputs']))
      ),
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.CLEAR_CELL_OUTPUT,
      id,
    };

    const state = reducers(originalState, action);
    const outputs = state.document.getIn(['notebook', 'cellMap', id, 'outputs']);
    expect(outputs).to.equal(List.of());
  });
});

describe('newCellAfter', () => {
  it('creates a brand new cell after the given id', () => {
    const originalState = {
      document: monocellDocument,
    };
    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.NEW_CELL_AFTER,
      id,
      cellType: 'markdown',
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellOrder']).size).to.equal(4);
    const cellID = state.document.getIn(['notebook', 'cellOrder']).last();
    const cell = state.document.getIn(['notebook', 'cellMap', cellID]);
    expect(cell.get('cell_type')).to.equal('markdown');
  });
});

describe('newCellBefore', () => {
  it('creates a new cell after the given id', () => {
    const originalState = {
      document: initialDocument.set('notebook', dummyCommutable),
    };

    const id = originalState.document.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.NEW_CELL_BEFORE,
      id,
      cellType: 'markdown',
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellOrder']).size).to.equal(3);
    expect(state.document.getIn(['notebook', 'cellOrder']).last()).to.equal(id);
  });
});

describe('mergeCellAfter', () => {
  it('merges cells appropriately', () => {
    const originalState = {
      document: initialDocument.set('notebook', dummyCommutable),
    }

    const id = originalState.document.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.MERGE_CELL_AFTER,
      id,
    }

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellOrder']).size).to.equal(1);
    expect(state.document.getIn(['notebook', 'cellOrder']).first()).to.equal(id);
  });
});

describe('newCellAppend', () => {
  it('appends a new code cell at the end', () => {
    const originalState = {
      document: initialDocument.set('notebook', dummyCommutable),
    };

    const action = {
      type: constants.NEW_CELL_APPEND,
      cellType: 'code',
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(['notebook', 'cellOrder']).size).to.equal(3);
  });
});
