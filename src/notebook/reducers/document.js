import * as commutable from 'commutable';
import * as uuid from 'uuid';

import * as constants from '../constants';

export default {
  [constants.SET_NOTEBOOK]: function setNotebook(state, action) {
    return {
      ...state,
      notebook: action.data,
    };
  },
  [constants.UPDATE_CELL_EXECUTION_COUNT]: function updateExecutionCount(state, action) {
    const { id, count } = action;
    const { notebook } = state;
    return {
      ...state,
      notebook: commutable.updateExecutionCount(notebook, id, count),
    };
  },
  [constants.MOVE_CELL]: function moveCell(state, action) {
    const { notebook } = state;
    return {
      ...state,
      notebook: notebook.update('cellOrder', cellOrder => {
        const oldIndex = cellOrder.findIndex(id => id === action.id);
        const newIndex = cellOrder.findIndex(id => id === action.destinationId)
                          + (action.above ? 0 : 1);
        if (oldIndex === newIndex) {
          return cellOrder;
        }
        return cellOrder
          .splice(oldIndex, 1)
          .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
      }),
    };
  },
  [constants.REMOVE_CELL]: function removeCell(state, action) {
    const { notebook } = state;
    const { id } = action;
    return {
      ...state,
      notebook: commutable.removeCell(notebook, id),
    };
  },
  [constants.NEW_CELL_AFTER]: function newCellAfter(state, action) {
    // Draft API
    const { cellType, id } = action;
    const { notebook } = state;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const index = notebook.get('cellOrder').indexOf(id) + 1;
    const cellID = uuid.v4();
    return {
      ...state,
      notebook: commutable.insertCellAt(notebook, cell, cellID, index),
    };
  },
  [constants.NEW_CELL_BEFORE]: function newCellBefore(state, action) {
    // Draft API
    const { cellType, id } = action;
    const { notebook } = state;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const index = notebook.get('cellOrder').indexOf(id);
    const cellID = uuid.v4();
    return {
      ...state,
      notebook: commutable.insertCellAt(notebook, cell, cellID, index),
    };
  },
  [constants.NEW_CELL_APPEND]: function newCellAppend(state, action) {
    // Draft API
    const { cellType } = action;
    const { notebook } = state;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const index = notebook.get('cellOrder').count();
    const cellID = uuid.v4();
    return {
      ...state,
      notebook: commutable.insertCellAt(notebook, cell, cellID, index),
    };
  },
  [constants.UPDATE_CELL_SOURCE]: function updateSource(state, action) {
    const { id, source } = action;
    const { notebook } = state;
    return {
      ...state,
      notebook: commutable.updateSource(notebook, id, source),
    };
  },
  [constants.UPDATE_CELL_OUTPUTS]: function updateOutputs(state, action) {
    const { id, outputs } = action;
    const { notebook } = state;
    return {
      ...state,
      notebook: commutable.updateOutputs(notebook, id, outputs),
    };
  },
  [constants.SET_LANGUAGE_INFO]: function setLanguageInfo(state, action) {
    const { langInfo } = action;
    const { notebook } = state;
    return {
      ...state,
      notebook: notebook.setIn(['metadata', 'language_info'], langInfo),
    };
  },
};
