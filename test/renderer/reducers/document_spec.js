import { expect } from 'chai';

import * as commutable from 'commutable';
import * as constants from '../../../src/notebook/constants';

import { DocumentRecord, MetadataRecord } from '../../../src/notebook/records';

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
const monocellDocument = initialDocument
  .set('notebook', commutable.appendCell(dummyCommutable, commutable.emptyCodeCell));

describe('setNotebook', () => {
  it('converts a JSON notebook to our commutable notebook and puts in state', () => {
    const initialState = {
      app: [],
      document: {
        past: [],
        present: initialDocument,
        future: [],
      },
    };
    const data = fromJS(dummyJSON);
    const state = reducers(initialState, { type: constants.SET_NOTEBOOK, data });
    expect(state.document.present.getIn(['notebook', 'nbformat'])).to.equal(4);
  });
});

describe('setLanguageInfo', () => {
  it('adds the metadata fields for the kernelspec and kernel_info', () => {
    const initialState = {
      app: [],
      document: {
        past: [],
        present: initialDocument,
        future: [],
      },
    };
    const kernelInfo = {
      name: 'french',
      spec: {
        language: 'french',
        display_name: 'français',
      }
    };
    const state = reducers(initialState, { type: constants.SET_KERNEL_INFO, kernelInfo });
    const metadata = state.document.present.getIn(['notebook', 'metadata']);
    console.log(metadata);
    expect(metadata.getIn(['kernel_info', 'name'])).to.equal('french');
    expect(metadata.getIn(['kernelspec', 'name'])).to.equal('french');
    expect(metadata.getIn(['kernelspec', 'display_name'])).to.equal('français');
  });
});

describe('focusCell', () => {
  it('should set focusedCell to the appropriate cell ID', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.FOCUS_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.get('focusedCell')).to.equal(id);
  });
});


describe('focusNextCell', () => {
  it('should focus the next cell if not the last cell', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.get('focusedCell')).to.not.be.null;
  });
  it('should return same state if last cell and createCellIfUndefined is false', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.get('focusedCell')).to.not.be.null;
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(3);
  });
  it('should create and focus a new cell if last cell', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
      createCellIfUndefined: true,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.focusedCell).to.not.be.null;
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(4);
  });
});

describe('focusPreviousCell', () => {
  it('should focus the previous cell', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook', dummyCommutable),
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();
    const previousId = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.FOCUS_PREVIOUS_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.get('focusedCell')).to.equal(previousId);
  });
});

describe('toggleStickyCell', () => {
  it('should stick the cell given its ID', () => {
    const doc = initialDocument.set('notebook', dummyCommutable)
                              .set('stickyCells', new Map());
    const originalState = {
      document: {
        past: [],
        present: doc,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.TOGGLE_STICKY_CELL,
      id,
    }

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['stickyCells', id])).to.be.true;
  });
});

describe('updateExecutionCount', () => {
  it('updates the execution count by id', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id,
      count: 42,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellMap', id, 'execution_count'])).to.equal(42);
  });
});

describe('moveCell', () => {
  it('should swap the first and last cell appropriately', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook', dummyCommutable),
        future: [],
      },
    };

    const cellOrder = originalState.document.present.getIn(['notebook', 'cellOrder']);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();

    const action = {
      type: constants.MOVE_CELL,
      id,
      destinationId,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).last()).to.equal(id);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).first()).to.equal(destinationId);
  });
});

describe('removeCell', () => {
  it('should remove a cell given an ID', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.REMOVE_CELL,
      id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(2);
  });
});

describe('clearCellOutput', () => {
  it('should clear outputs list', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook',
          commutable.appendCell(dummyCommutable,
            commutable.emptyCodeCell.set('outputs', ['dummy outputs']))
          ),
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.CLEAR_CELL_OUTPUT,
      id,
    };

    const state = reducers(originalState, action);
    const outputs = state.document.present.getIn(['notebook', 'cellMap', id, 'outputs']);
    expect(outputs).to.equal(List.of());
  });
});

describe('newCellAfter', () => {
  it('creates a brand new cell after the given id', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };
    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.NEW_CELL_AFTER,
      id,
      cellType: 'markdown',
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(4);
    const cellID = state.document.present.getIn(['notebook', 'cellOrder']).last();
    const cell = state.document.present.getIn(['notebook', 'cellMap', cellID]);
    expect(cell.get('cell_type')).to.equal('markdown');
  });
});

describe('newCellBefore', () => {
  it('creates a new cell after the given id', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook', dummyCommutable),
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.NEW_CELL_BEFORE,
      id,
      cellType: 'markdown',
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(3);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).last()).to.equal(id);
  });
});

describe('mergeCellAfter', () => {
  it('merges cells appropriately', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook', dummyCommutable),
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();
    const action = {
      type: constants.MERGE_CELL_AFTER,
      id,
    }

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(1);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).first()).to.equal(id);
  });
});

describe('newCellAppend', () => {
  it('appends a new code cell at the end', () => {
    const originalState = {
      document: {
        past: [],
        present: initialDocument.set('notebook', dummyCommutable),
        future: [],
      },
    };

    const action = {
      type: constants.NEW_CELL_APPEND,
      cellType: 'code',
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(3);
  });
});

describe('overwriteMetadata', () => {
  it('overwrites notebook metadata appropriately', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const action = {
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "name",
      value: "javascript",
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'metadata', 'name'])).to.equal("javascript");
  });
});

describe('splitCell', () => {
  it('splits a notebook cell into two', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.SPLIT_CELL,
      id: id,
      position: 0,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(4);
  });
});

describe('changeOutputVisibility', () => {
  it('changes the visibility on a single cell', () => {
    let cellStatuses = new Map();
    monocellDocument.getIn(['notebook', 'cellOrder']).map((cellID) => {
      cellStatuses = cellStatuses.setIn([cellID, 'isHidden'], false);
      return cellStatuses;
    });
    const docWithOutputStatuses = monocellDocument.set('cellStatuses', cellStatuses);

    const originalState = {
      document: {
        past: [],
        present: docWithOutputStatuses,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id: id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['cellStatuses', id, 'outputHidden'])).to.be.true;
  });
});

describe('changeInputVisibility', () => {
  it('changes the input visibility on a single cell', () => {
    let cellStatuses = new Map();
    monocellDocument.getIn(['notebook', 'cellOrder']).map((cellID) => {
      cellStatuses = cellStatuses.setIn([cellID, 'outputHidden'], false)
                                .setIn([cellID, 'inputHidden'], false);
      return cellStatuses;
    });
    const docWithStatuses = monocellDocument.set('cellStatuses', cellStatuses);

    const originalState = {
      document: {
        past: [],
        present: docWithStatuses,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.CHANGE_INPUT_VISIBILITY,
      id: id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['cellStatuses', id, 'inputHidden'])).to.be.true;
  });
});

describe('copyCell', () => {
  it('copies a cell', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = originalState.document.present.getIn(['notebook', 'cellOrder']).first();
    const cell = originalState.document.present.getIn(['notebook', 'cellMap', id]);

    const action = {
      type: constants.COPY_CELL,
      id: id,
    };

    const state = reducers(originalState, action);
    expect(state.document.present.getIn(['copied', 'cell'])).to.equal(cell);
    expect(state.document.present.getIn(['copied', 'id'])).to.equal(id);
  });
});

describe('pasteCell', () => {
  it('pastes a cell', () => {
    const id = monocellDocument.getIn(['notebook', 'cellOrder']).first();
    const cell = monocellDocument.getIn(['notebook', 'cellMap', id]);

    const originalState = {
      document: {
        past: [],
        present: monocellDocument.set('copied', new Map({cell, id})),
        future: [],
      },
    };

    const action = {
      type: constants.PASTE_CELL,
    };

    const state = reducers(originalState, action);
    const copiedId = state.document.present.getIn(['notebook', 'cellOrder', 1]);

    expect(state.document.present.getIn(['notebook', 'cellOrder']).size).to.equal(4);
    expect(copiedId).to.not.equal(id);
    expect(state.document.present.getIn(['notebook', 'cellMap', copiedId, 'source']))
      .to.equal(cell.get('source'));
  });
});

describe('changeCellType', () => {
  it('converts code cell to markdown cell', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = monocellDocument.getIn(['notebook', 'cellOrder']).last();

    const action = {
      type: constants.CHANGE_CELL_TYPE,
      id: id,
      to: 'markdown',
    };

    const state = reducers(originalState, action);

    expect(state.document.present.getIn(['notebook', 'cellMap', id, 'cell_type']))
      .to.equal('markdown');
  });
  it('converts markdown cell to code cell', () => {
    const originalState = {
      document: {
        past: [],
        present: monocellDocument,
        future: [],
      },
    };

    const id = monocellDocument.getIn(['notebook', 'cellOrder']).first();

    const action = {
      type: constants.CHANGE_CELL_TYPE,
      id: id,
      to: 'code',
    };

    const state = reducers(originalState, action);

    expect(state.document.present.getIn(['notebook', 'cellMap', id, 'cell_type']))
      .to.equal('code');
    expect(state.document.present.getIn(['notebook', 'cellMap', id, 'outputs']))
      .to.not.be.undefined;
  });
});
