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
  READ_NOTEBOOK,
  SET_SELECTED,
  START_SAVING,
  UPDATE_CELL_EXECUTION_COUNT,
  UPDATE_CELL_OUTPUTS,
  UPDATE_CELL_SOURCE,
} from '../actions/constants';

import {
  loadNotebook,
  updateExecutionCount,
} from './document';

export const reducers = {};

reducers[READ_NOTEBOOK] = loadNotebook;
reducers[UPDATE_CELL_EXECUTION_COUNT] = updateExecutionCount;

reducers[NEW_CELL_AFTER] = function newCell(state, action) {
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

reducers[UPDATE_CELL_SOURCE] = function updateSource(state, action) {
  const { id, source } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'source'], source);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
};

reducers[UPDATE_CELL_OUTPUTS] = function updateOutputs(state, action) {
  const { id, outputs } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'outputs'], outputs);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
};

reducers[SET_SELECTED] = function setSelected(state, action) {
  const selected = action.additive ?
      state.selected.concat(action.ids) :
      action.ids;
  return Object.assign({}, state, {
    selected,
  });
};

reducers[MOVE_CELL] = function moveCell(state, action) {
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

reducers[NEW_KERNEL] = function newKernel(state, action) {
  const { channels, connectionFile, spawn } = action;
  state.channels = channels;
  state.connectionFile = connectionFile;
  state.spawn = spawn;
  return state;
};

function cleanupKernel(state) {
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

  delete state.channels;
  delete state.spawn;
  delete state.connectionFile;
  return state;
}

reducers[EXIT] = function exit(state) {
  return cleanupKernel(state);
};

reducers[KILL_KERNEL] = cleanupKernel;

reducers[START_SAVING] = function startSaving(state) {
  return Object.assign({}, state, { isSaving: true });
};

reducers[DONE_SAVING] = function doneSaving(state) {
  return Object.assign({}, state, { isSaving: false });
};

reducers[CHANGE_FILENAME] = function changeFilename(state, action) {
  const { filename } = action;
  if(!filename) {
    return state;
  }
  return Object.assign({}, state, { filename });
};
