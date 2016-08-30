import {
  ipcRenderer as ipc,
  webFrame,
  remote,
} from 'electron';

import * as path from 'path';

import { ActionCreators } from 'redux-undo';

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

export function dispatchSaveAs(store, evt, filename) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  store.dispatch(saveAs(filename, notebook));
}

const remoteElectron = remote.require('electron');
const dialog = remoteElectron.dialog;

export function showSaveAsDialog(defaultPath) {
  return new Promise((resolve) => {
    const filename = dialog.showSaveDialog({
      title: 'Save Notebook',
      defaultPath,
      filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
    });

    if (filename && path.extname(filename) === '') {
      resolve(`${filename}.ipynb`);
    }
    resolve(filename);
  });
}

export function triggerSaveAs(store) {
  showSaveAsDialog()
    .then(filename => {
      if (!filename) {
        return;
      }
      const state = store.getState();
      const executionState = state.app.get('executionState');
      const notebook = state.document.get('notebook');
      store.dispatch(saveAs(filename, notebook));
      BrowserWindow.getFocusedWindow().setTitle(`${tildify(filename)} - ${executionState}`);
    }
  );
}

export function dispatchSave(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const filename = state.metadata.get('filename');
  const notificationSystem = state.app.get('notificationSystem');
  try {
    if (!filename) {
      triggerSaveAs(store);
    } else {
      store.dispatch(save(filename, notebook));
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

export function dispatchNewKernel(store, evt, name) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.document && state.metadata.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.metadata.get('filename')));
  }
  store.dispatch(newKernel(name, spawnOptions));
}

export function dispatchPublishGist(store) {
  const state = store.getState();
  const filename = state.metadata.get('filename');
  const notebook = state.document.get('notebook');
  const notificationSystem = state.app.get('notificationSystem');
  const github = state.app.get('github');

  const agenda = publish(github, notebook, filename, notificationSystem);

  agenda.subscribe((action) => {
    store.dispatch(action);
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

export function dispatchRunAll(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const cells = notebook.get('cellMap');
  notebook.get('cellOrder').filter((cellID) =>
    cells.getIn([cellID, 'cell_type']) === 'code')
      .map((cellID) => store.dispatch(
        executeCell(
          cellID,
          cells.getIn([cellID, 'source'])
        )
  ));
}

export function dispatchClearAll(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  notebook.get('cellOrder').map((value) => store.dispatch(clearCellOutput(value)));
}

export function dispatchKillKernel(store) {
  store.dispatch(killKernel);
}

export function dispatchInterruptKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  if (process.platform === 'win32') {
    notificationSystem.addNotification({
      title: 'Not supported in Windows',
      message: 'Kernel interruption is currently not supported in Windows.',
      level: 'error',
    });
  } else {
    store.dispatch(interruptKernel);
  }
}

export function dispatchRestartKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  const spawnOptions = {};
  if (state && state.document && state.metadata.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.metadata.filename));
  }

  store.dispatch(killKernel);
  store.dispatch(newKernel(state.app.kernelSpecName, spawnOptions));

  notificationSystem.addNotification({
    title: 'Kernel Restarted',
    message: `Kernel ${state.app.kernelSpecName} has been restarted.`,
    dismissible: true,
    position: 'tr',
    level: 'success',
  });
}

export function dispatchRestartClearAll(store) {
  dispatchRestartKernel(store);
  dispatchClearAll(store);
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

export function initMenuHandlers(store) {
  ipc.on('menu:new-kernel', dispatchNewKernel.bind(null, store));
  ipc.on('menu:run-all', dispatchRunAll.bind(null, store));
  ipc.on('menu:clear-all', dispatchClearAll.bind(null, store));
  ipc.on('menu:save', dispatchSave.bind(null, store));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store));
  ipc.on('menu:duplicate-notebook', dispatchDuplicate.bind(null, store));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store));
  ipc.on('menu:interrupt-kernel', dispatchInterruptKernel.bind(null, store));
  ipc.on('menu:restart-kernel', dispatchRestartKernel.bind(null, store));
  ipc.on('menu:restart-and-clear-all', dispatchRestartClearAll.bind(null, store));
  ipc.on('menu:publish:gist', dispatchPublishGist.bind(null, store));
  ipc.on('menu:zoom-in', dispatchZoomIn.bind(null, store));
  ipc.on('menu:zoom-out', dispatchZoomOut.bind(null, store));
}
