import * as fs from 'fs';

import {
  CHANGE_FILENAME,
  DONE_SAVING,
  EXIT,
  KILL_KERNEL,
  MOVE_CELL,
  NEW_CELL_AFTER,
  NEW_CELL_BEFORE,
  NEW_CELL_APPEND,
  NEW_KERNEL,
  SET_NOTEBOOK,
  REMOVE_CELL,
  START_SAVING,
  UPDATE_CELL_EXECUTION_COUNT,
  UPDATE_CELL_OUTPUTS,
  UPDATE_CELL_SOURCE,
  ERROR_KERNEL_NOT_CONNECTED,
} from '../actions/constants';

import {
  updateExecutionCount,
  setNotebook,
  moveCell,
  newCellAfter,
  newCellBefore,
  newCellAppend,
  removeCell,
  updateSource,
  updateOutputs,
} from './document';

export const reducers = {};

reducers[SET_NOTEBOOK] = setNotebook;
reducers[UPDATE_CELL_EXECUTION_COUNT] = updateExecutionCount;
reducers[NEW_CELL_AFTER] = newCellAfter;
reducers[NEW_CELL_BEFORE] = newCellBefore;
reducers[NEW_CELL_APPEND] = newCellAppend;
reducers[UPDATE_CELL_SOURCE] = updateSource;
reducers[UPDATE_CELL_OUTPUTS] = updateOutputs;
reducers[MOVE_CELL] = moveCell;
reducers[REMOVE_CELL] = removeCell;

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

reducers[NEW_KERNEL] = function newKernel(state, action) {
  const { channels, connectionFile, spawn } = action;

  return Object.assign({}, cleanupKernel(state), {
    channels,
    connectionFile,
    spawn,
  });
};

reducers[EXIT] = function exit(state) {
  return cleanupKernel(state);
};

reducers[KILL_KERNEL] = cleanupKernel;

reducers[START_SAVING] = function startSaving(state) {
  return Object.assign({}, state, { isSaving: true });
};

reducers[ERROR_KERNEL_NOT_CONNECTED] = function alertKernelNotConnected(state) {
  return Object.assign({}, state, { error: 'Error: We\'re not connected to a runtime!' });
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
