import * as commutable from 'commutable';
import * as fs from 'fs';

import {
  CHANGE_FILENAME,
  DONE_SAVING,
  EXIT,
  KILL_KERNEL,
  MOVE_CELL,
  NEW_CELL_AFTER,
  NEW_KERNEL,
  READ_JSON,
  SET_SELECTED,
  START_SAVING,
  UPDATE_CELL_EXECUTION_COUNT,
  UPDATE_CELL_OUTPUTS,
  UPDATE_CELL_SOURCE,
} from '../actions/constants';

export const reducers = {};

reducers[READ_JSON] = (state, action) => {
  const { data } = action;
  const fetchedNotebook = commutable.fromJS(data);
  return Object.assign({}, state, {
    notebook: fetchedNotebook,
  });
};

reducers[UPDATE_CELL_EXECUTION_COUNT] = (state, action) => {
  const { id, count } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'execution_count'], count);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
};

reducers[NEW_CELL_AFTER] = (state, action) => {
  // Draft API
  const { cellType, id } = action;
  const { notebook } = state;
  const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                         commutable.emptyCodeCell;
  const index = notebook.get('cellOrder').indexOf(id) + 1;
  return Object.assign({}, state, {
    notebook: commutable.insertCellAt(notebook, cell, index),
  });
};

reducers[UPDATE_CELL_SOURCE] = (state, action) => {
  const { id, source } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'source'], source);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
};

reducers[UPDATE_CELL_OUTPUTS] = (state, action) => {
  const { id, outputs } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'outputs'], outputs);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
};

reducers[SET_SELECTED] = (state, action) => {
  const selected = action.additive ?
      state.selected.concat(action.ids) :
      action.ids;
  return Object.assign({}, state, {
    selected,
  });
};

reducers[MOVE_CELL] = (state, action) => {
  const { notebook } = state;
  return Object.assign({}, state, {
    notebook: notebook.update('cellOrder', cellOrder => {
      const oldIndex = cellOrder.findIndex(id => id === action.id);
      const newIndex = cellOrder.findIndex(id => id === action.destinationId) + (action.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
    }),
  });
};

reducers[NEW_KERNEL] = (state, action) => {
  const { channels, connectionFile, spawn } = action;
  state.channels = channels;
  state.connectionFile = connectionFile;
  state.spawn = spawn;
  return state;
};

reducers[EXIT] = state => {
  close();
  return state;
};

reducers[KILL_KERNEL] = state => {
  if (state.channels) {
    state.channels.shell.complete();
    state.channels.iopub.complete();
    state.channels.stdin.complete();
    state.channels = null;
  }
  if (state.spawn) {
    state.spawn.kill();
    state.spawn = null;
  }
  if (state.connectionFile) {
    fs.unlink(state.connectionFile);
    state.connectionFile = null;
  }
  return state;
};

reducers[START_SAVING] = state => {
  return Object.assign({}, state, { isSaving: true });
};

reducers[DONE_SAVING] = state => {
  return Object.assign({}, state, { isSaving: false });
};

reducers[CHANGE_FILENAME] = (state, action) => {
  const { filename } = action;
  if(!filename) {
    return state;
  }
  return Object.assign({}, state, { filename });
};
