const path = require('path');

import {
  showSaveAsDialog,
} from '../api/save';

import {
  newKernel,
  save,
  saveAs,
  killKernel,
} from '../actions';
import { ipcRenderer as ipc } from 'electron';

export function dispatchSaveAs(store, dispatch, evt, filename) {
  const state = store.getState();
  const { notebook } = state;
  dispatch(saveAs(filename, notebook));
}

export function triggerSaveAs(store, dispatch) {
  showSaveAsDialog()
    .then(filename => {
      if (!filename) {
        return;
      }
      const { notebook } = store.getState();
      dispatch(saveAs(filename, notebook));
    }
  );
}

export function dispatchSave(store, dispatch) {
  const state = store.getState();
  const { notebook, filename } = state;
  if (!filename) {
    triggerSaveAs(store, dispatch);
  } else {
    dispatch(save(filename, notebook));
  }
}

export function dispatchNewkernel(store, dispatch, evt, name) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.filename) {
    spawnOptions.cwd = path.dirname(path.resolve(state.filename));
  }
  dispatch(newKernel(name, spawnOptions));
}

export function dispatchKillKernel(store, dispatch) {
  dispatch(killKernel());
}

export function initMenuHandlers(store, dispatch) {
  ipc.on('menu:new-kernel', dispatchNewkernel.bind(null, store, dispatch));
  ipc.on('menu:save', dispatchSave.bind(null, store, dispatch));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store, dispatch));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store, dispatch));
}
