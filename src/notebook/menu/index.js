const path = require('path');

import {
  showSaveAsDialog,
} from '../api/save';

import { tildify } from '../native-window';

import {
  executeCell,
  clearCellOutput,
  newKernel,
  save,
  saveAs,
  killKernel,
  interruptKernel,
  undo,
  redo,
} from '../actions';


import { ipcRenderer as ipc, webFrame, remote } from 'electron';
const BrowserWindow = remote.BrowserWindow;

import {
  publish,
} from '../publication/github';

export function dispatchSaveAs(store, dispatch, evt, filename) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  dispatch(saveAs(filename, notebook));
}

export function triggerSaveAs(store, dispatch) {
  showSaveAsDialog()
    .then(filename => {
      if (!filename) {
        return;
      }
      const state = store.getState();
      const { executionState } = state.document;
      const notebook = state.document.get('notebook');
      dispatch(saveAs(filename, notebook));
      BrowserWindow.getFocusedWindow().setTitle(`${tildify(filename)} - ${executionState}`);
    }
  );
}

export function dispatchSave(store, dispatch) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const filename = state.document.get('filename');
  if (!filename) {
    triggerSaveAs(store, dispatch);
  } else {
    dispatch(save(filename, notebook));
  }
}

export function dispatchNewkernel(store, dispatch, evt, name) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.document && state.document.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.filename));
  }
  dispatch(newKernel(name, spawnOptions));
}

export function dispatchPublishGist(store, dispatch) {
  const state = store.getState();
  const filename = state.document.get('filename');
  const notebook = state.document.get('notebook');
  const { notificationSystem, github } = state.app;

  const agenda = publish(github, notebook, filename, notificationSystem);

  agenda.subscribe((action) => {
    dispatch(action);
  }, (err) => {
    if (err.message) {
      const githubError = JSON.parse(err.message);
      if (githubError.message === 'Bad credentials') {
        notificationSystem.addNotification({
          title: 'Bad credentials',
          message: 'Unable to authenticate with your credentials.\n' +
                   'What do you have $GITHUB_TOKEN set to?',
          level: 'error',
        });
        return;
      }
      notificationSystem.addNotification({
        title: 'Publication Error',
        message: githubError.message,
        level: 'error',
      });
      return;
    }
    notificationSystem.addNotification({
      title: 'Unknown Publication Error',
      message: err.toString(),
      level: 'error',
    });
  });
}

export function dispatchRunAll(store, dispatch) {
  const state = store.getState();
  const { channels, executionState, notificationSystem } = state.app;
  const notebook = state.document.get('notebook');
  const cells = notebook.get('cellMap');
  const kernelConnected = channels &&
    !(executionState === 'starting' || executionState === 'not connected');
  notebook.get('cellOrder').map((value) => dispatch(
    executeCell(
      channels,
      value,
      cells.getIn([value, 'source']),
      kernelConnected,
      notificationSystem
    )
  ));
}

export function dispatchClearAll(store, dispatch) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  notebook.get('cellOrder').map((value) => dispatch(clearCellOutput(value)));
}

export function dispatchKillKernel(store, dispatch) {
  dispatch(killKernel);
}

export function dispatchInterruptKernel(store, dispatch) {
  dispatch(interruptKernel);
}

export function dispatchRestartKernel(store, dispatch) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.document && state.document.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.filename));
  }

  dispatch(killKernel);
  dispatch(newKernel(state.app.kernelSpecName, spawnOptions));

  state.document.notificationSystem.addNotification({
    title: 'Kernel Restarted',
    message: `Kernel ${state.app.kernelSpecName} has been restarted.`,
    dismissible: true,
    position: 'tr',
    level: 'success',
  });
}

export function dispatchRestartClearAll(store, dispatch) {
  dispatchRestartKernel(store, dispatch);
  dispatchClearAll(store, dispatch);
}

export function dispatchZoomIn() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
}

export function initMenuHandlers(store, dispatch) {
  ipc.on('menu:new-kernel', dispatchNewkernel.bind(null, store, dispatch));
  ipc.on('menu:run-all', dispatchRunAll.bind(null, store, dispatch));
  ipc.on('menu:clear-all', dispatchClearAll.bind(null, store, dispatch));
  ipc.on('menu:save', dispatchSave.bind(null, store, dispatch));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store, dispatch));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store, dispatch));
  ipc.on('menu:interrupt-kernel', dispatchInterruptKernel.bind(null, store, dispatch));
  ipc.on('menu:restart-kernel', dispatchRestartKernel.bind(null, store, dispatch));
  ipc.on('menu:restart-and-clear-all', dispatchRestartClearAll.bind(null, store, dispatch));
  ipc.on('menu:publish:gist', dispatchPublishGist.bind(null, store, dispatch));
  ipc.on('menu:zoom-in', dispatchZoomIn.bind(null, store, dispatch));
  ipc.on('menu:zoom-out', dispatchZoomOut.bind(null, store, dispatch));
}
