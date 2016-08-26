import {
  ipcRenderer as ipc,
  webFrame,
  remote,
} from 'electron';

import { ActionCreators } from 'redux-undo';

import {
  showSaveAsDialog,
} from './api/save';

import { tildify, launchFilename } from './native-window';

import { executeCell } from './epics/execute';

import {
  clearCellOutput,
  newKernel,
  killKernel,
  interruptKernel,
} from './actions';

import {
  save,
  saveAs,
} from './epics/saving';

import { copyNotebook } from './utils';

import publish from './publication/github';

const BrowserWindow = remote.BrowserWindow;

const path = require('path');

export function dispatchSaveAs(store, dispatch, evt, filename) {
  const state = store.getState();
  const notebook = state.document.present.get('notebook');
  dispatch(saveAs(filename, notebook));
}

export function triggerSaveAs(store, dispatch) {
  showSaveAsDialog()
    .then(filename => {
      if (!filename) {
        return;
      }
      const state = store.getState();
      const executionState = state.app.get('executionState');
      const notebook = state.document.present.get('notebook');
      dispatch(saveAs(filename, notebook));
      BrowserWindow.getFocusedWindow().setTitle(`${tildify(filename)} - ${executionState}`);
    }
  );
}

export function dispatchSave(store, dispatch) {
  const state = store.getState();
  const notebook = state.document.present.get('notebook');
  const filename = state.metadata.get('filename');
  const notificationSystem = state.app.get('notificationSystem');
  try {
    if (!filename) {
      triggerSaveAs(store, dispatch);
    } else {
      dispatch(save(filename, notebook));
    }
    notificationSystem.addNotification({
      title: 'Save successful!',
      autoDismiss: 2,
      level: 'success',
    });
  } catch (err) {
    notificationSystem.addNotification({
      title: 'Save failed!',
      message: err.message,
      level: 'error',
    });
  }
}

export function dispatchNewKernel(store, dispatch, evt, name) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.document.present && state.metadata.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.metadata.get('filename')));
  }
  dispatch(newKernel(name, spawnOptions));
}

export function dispatchPublishGist(store, dispatch) {
  const state = store.getState();
  const filename = state.metadata.get('filename');
  const notebook = state.document.present.get('notebook');
  const notificationSystem = state.app.get('notificationSystem');
  const github = state.app.get('github');

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
  const notebook = state.document.present.get('notebook');
  const cells = notebook.get('cellMap');
  notebook.get('cellOrder').filter((cellID) =>
    cells.getIn([cellID, 'cell_type']) === 'code')
      .map((cellID) => dispatch(
        executeCell(
          cellID,
          cells.getIn([cellID, 'source'])
        )
  ));
}

export function dispatchClearAll(store, dispatch) {
  const state = store.getState();
  const notebook = state.document.present.get('notebook');
  notebook.get('cellOrder').map((value) => dispatch(clearCellOutput(value)));
}

export function dispatchKillKernel(store, dispatch) {
  dispatch(killKernel);
}

export function dispatchInterruptKernel(store, dispatch) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  if (process.platform === 'win32') {
    notificationSystem.addNotification({
      title: 'Not supported in Windows',
      message: 'Kernel interruption is currently not supported in Windows.',
      level: 'error',
    });
  } else {
    dispatch(interruptKernel);
  }
}

export function dispatchRestartKernel(store, dispatch) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  const spawnOptions = {};
  if (state && state.document.present && state.metadata.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.metadata.filename));
  }

  dispatch(killKernel);
  dispatch(newKernel(state.app.kernelSpecName, spawnOptions));

  notificationSystem.addNotification({
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

export function dispatchUndo(store, dispatch) {
  dispatch(ActionCreators.undo());
}

export function dispatchRedo(store, dispatch) {
  dispatch(ActionCreators.redo());
}

export function dispatchZoomIn() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
}

export function dispatchDuplicate(store) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  const filename = state.metadata.get('filename');
  if (filename) {
    copyNotebook(filename).then((value) => {
      launchFilename(value);
    });
  } else {
    notificationSystem.addNotification({
      title: 'Can\'t Duplicate Unsaved Notebook',
      message: 'A notebook must be saved before it can be duplicated.',
      dismissble: true,
      position: 'tr',
      level: 'warning',
    });
  }
}

export function initMenuHandlers(store, dispatch) {
  ipc.on('menu:undo', dispatchUndo.bind(null, store, dispatch));
  ipc.on('menu:redo', dispatchRedo.bind(null, store, dispatch));
  ipc.on('menu:new-kernel', dispatchNewKernel.bind(null, store, dispatch));
  ipc.on('menu:run-all', dispatchRunAll.bind(null, store, dispatch));
  ipc.on('menu:clear-all', dispatchClearAll.bind(null, store, dispatch));
  ipc.on('menu:save', dispatchSave.bind(null, store, dispatch));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store, dispatch));
  ipc.on('menu:duplicate-notebook', dispatchDuplicate.bind(null, store));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store, dispatch));
  ipc.on('menu:interrupt-kernel', dispatchInterruptKernel.bind(null, store, dispatch));
  ipc.on('menu:restart-kernel', dispatchRestartKernel.bind(null, store, dispatch));
  ipc.on('menu:restart-and-clear-all', dispatchRestartClearAll.bind(null, store, dispatch));
  ipc.on('menu:publish:gist', dispatchPublishGist.bind(null, store, dispatch));
  ipc.on('menu:zoom-in', dispatchZoomIn.bind(null, store, dispatch));
  ipc.on('menu:zoom-out', dispatchZoomOut.bind(null, store, dispatch));
}
