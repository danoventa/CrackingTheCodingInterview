
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

export function initMenuHandlers(store, dispatch) {
  function triggerSaveAs() {
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

  ipc.on('menu:new-kernel', (evt, name) => dispatch(newKernel(name)));
  ipc.on('menu:save', () => {
    const state = store.getState();
    const { notebook, filename } = state;
    if (!filename) {
      triggerSaveAs();
    } else {
      dispatch(save(filename, notebook));
    }
  });
  ipc.on('menu:save-as', (evt, filename) => {
    const state = store.getState();
    const { notebook } = state;
    dispatch(saveAs(filename, notebook));
  });
  ipc.on('menu:kill-kernel', () => dispatch(killKernel()));
}
