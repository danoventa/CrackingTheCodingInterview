import Immutable from 'immutable';

import Rx from 'rxjs/Rx';

import * as agendas from './agendas';
import { launchKernel } from './api/kernel';
import * as constants from './constants';

const path = require('path');

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState,
  };
}

export function setLanguageInfo(langInfo) {
  return {
    type: constants.SET_LANGUAGE_INFO,
    langInfo,
  };
}

export function newKernel(kernelSpecName, cwd) {
  return () => Rx.Observable.create((subscriber) => {
    launchKernel(kernelSpecName, { cwd })
      .then(kc => {
        const { channels, connectionFile, spawn } = kc;

        // Listen to the execution status of the kernel
        channels.iopub
          .filter(msg => msg.header.msg_type === 'status')
          .map(msg => msg.content.execution_state)
          .subscribe(() => subscriber.next(setExecutionState('idle')));

        agendas.acquireKernelInfo(channels)
          .subscribe(action => {
            subscriber.next(action);
            subscriber.next(setExecutionState('idle'));
          });

        subscriber.next({
          type: constants.NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
          kernelSpecName,
        });
      })
      .catch((err) => console.error(err));
  });
}


export function setNotebook(nbData, filename) {
  const cwd = (filename && path.dirname(path.resolve(filename))) || process.cwd();
  return (actions, store) => Rx.Observable.create((subscriber) => {
    const data = Immutable.fromJS(nbData);
    subscriber.next({
      type: constants.SET_NOTEBOOK,
      data,
    });

    // Get the kernel name from the kernelspec, fallback on language_info, and
    // in the worse case scenario spawn a Python 3 kernel.
    const kernelName = data.getIn([
      'metadata', 'kernelspec', 'name',
    ], data.getIn([
      'metadata', 'language_info', 'name',
    ], 'python3'));
    store.dispatch(newKernel(kernelName, cwd));
  });
}

export function updateCellSource(id, source) {
  return {
    type: constants.UPDATE_CELL_SOURCE,
    id,
    source,
  };
}

export function updateCellOutputs(id, outputs) {
  return {
    type: constants.UPDATE_CELL_OUTPUTS,
    id,
    outputs,
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: constants.MOVE_CELL,
    id,
    destinationId,
    above,
  };
}

export function removeCell(id) {
  return {
    type: constants.REMOVE_CELL,
    id,
  };
}

export function createCellAfter(cellType, id, source) {
  return {
    type: constants.NEW_CELL_AFTER,
    source: source || '',
    cellType,
    id,
  };
}

export function createCellBefore(cellType, id) {
  return {
    type: constants.NEW_CELL_BEFORE,
    cellType,
    id,
  };
}

export function createCellAppend(cellType) {
  return {
    type: constants.NEW_CELL_APPEND,
    cellType,
  };
}

export function mergeCellAfter(id) {
  return {
    type: constants.MERGE_CELL_AFTER,
    id,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: constants.UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function clearCellOutput(id) {
  return {
    type: constants.CLEAR_CELL_OUTPUT,
    id,
  };
}

export function changeOutputVisibility(id) {
  return {
    type: constants.CHANGE_OUTPUT_VISIBILITY,
    id,
  };
}

export function changeInputVisibility(id) {
  return {
    type: constants.CHANGE_INPUT_VISIBILITY,
    id,
  };
}

export function updateCellPagers(id, pagers) {
  return {
    type: constants.UPDATE_CELL_PAGERS,
    id,
    pagers,
  };
}

export function updateCellStatus(id, status) {
  return {
    type: constants.UPDATE_CELL_STATUS,
    id,
    status,
  };
}

export function focusCell(id) {
  return {
    type: constants.FOCUS_CELL,
    id,
  };
}

export function focusNextCell(id, createCellIfUndefined) {
  return {
    type: constants.FOCUS_NEXT_CELL,
    id,
    createCellIfUndefined,
  };
}

export function focusPreviousCell(id) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL,
    id,
  };
}

export function toggleStickyCell(id) {
  return {
    type: constants.TOGGLE_STICKY_CELL,
    id,
  };
}

export function executeCell(channels, id, source, kernelConnected, notificationSystem) {
  return (actions, store) => Rx.Observable.create((subscriber) => {
    store.dispatch({ type: 'ABORT_EXECUTION', id });

    if (!kernelConnected) {
      notificationSystem.addNotification({
        title: 'Could not execute cell',
        message: 'The cell could not be executed because the kernel is not connected.',
        level: 'error',
      });
      store.dispatch(updateCellExecutionCount(id, undefined));
      return;
    }

    const obs = agendas.executeCell(store, channels, id, source).takeUntil(
      actions.filter(x => x.type === 'ABORT_EXECUTION' && x.id === id)
    );

    obs.subscribe(action => {
      subscriber.next(action);
    }, (error) => {
      subscriber.next({ type: constants.ERROR_KERNEL_NOT_CONNECTED, message: error });
    });
  });
}

export function splitCell(id, position) {
  return {
    type: constants.SPLIT_CELL,
    id,
    position,
  };
}

export function overwriteMetadata(field, value) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value,
  };
}

export const killKernel = {
  type: constants.KILL_KERNEL,
};

export const interruptKernel = {
  type: constants.INTERRUPT_KERNEL,
};

export function setNotificationSystem(notificationSystem) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem,
  };
}

export function associateCellToMsg(cellId, msgId) {
  return {
    type: constants.ASSOCIATE_CELL_TO_MSG,
    cellId,
    msgId,
  };
}

export function setForwardCheckpoint(documentState) {
  return {
    type: constants.SET_FORWARD_CHECKPOINT,
    documentState,
  };
}

export function setBackwardCheckpoint(documentState, clearFutureStack) {
  return {
    type: constants.SET_BACKWARD_CHECKPOINT,
    documentState,
    clearFutureStack,
  };
}

export const undo = {
  type: constants.UNDO,
};

export const redo = {
  type: constants.REDO,
};

export function updateDocument(newDocument) {
  return {
    type: constants.UPDATE_DOCUMENT,
    newDocument,
  };
}

export function copyCell(id) {
  return {
    type: constants.COPY_CELL,
    id,
  };
}

export function pasteCell() {
  return {
    type: constants.PASTE_CELL,
  };
}

export function changeCellType(id, to) {
  return {
    type: constants.CHANGE_CELL_TYPE,
    id,
    to,
  };
}

export function setModified(value) {
  return {
    type: constants.SET_MODIFIED,
    value,
  };
}
