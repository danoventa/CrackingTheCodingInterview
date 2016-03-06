import * as commutable from 'commutable';

import * as agendas from '../agendas';

import { launchKernel } from '../api/kernel';

import { writeFile } from 'fs';

import {
  EXIT,
  KILL_KERNEL,
  NEW_KERNEL,
  START_SAVING,
  DONE_SAVING,
  CHANGE_FILENAME,
  UPDATE_CELL_SOURCE,
  UPDATE_CELL_OUTPUTS,
  MOVE_CELL,
  NEW_CELL_AFTER,
  NEW_CELL_APPEND,
  NEW_CELL_BEFORE,
  REMOVE_CELL,
  SET_NOTEBOOK,
  UPDATE_CELL_EXECUTION_COUNT,
  ERROR_KERNEL_NOT_CONNECTED,
} from './constants';

import Immutable from 'immutable';
import * as path from 'path';

const remote = require('remote');
const dialog = remote.require('dialog');

export function exit() {
  return {
    type: EXIT,
  };
}

export function killKernel() {
  return {
    type: KILL_KERNEL,
  };
}

export function newKernel(kernelSpecName) {
  return (subject) => {
    launchKernel(kernelSpecName)
      .then(kc => {
        const { channels, connectionFile, spawn } = kc;
        subject.next({
          type: NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
        });
      })
      .catch((err) => console.error(err));
  };
}

export function save(filename, notebook) {
  return (subject, dispatch) => {
    // If there isn't a filename, save-as it instead
    if (!filename) {
      const opts = {
        title: 'Save Notebook As',
        filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
      };
      dialog.showSaveDialog(opts, (fname) => {
        if (!filename) {
          return;
        }
        const ext = path.extname(fname) === '' ? '.ipynb' : '';

        dispatch(saveAs(fname + ext, notebook));
      });
      return;
    }

    subject.next({
      type: START_SAVING,
    });
    writeFile(filename, JSON.stringify(commutable.toJS(notebook), null, 2), (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
      subject.next({
        type: DONE_SAVING,
      });
    });
  };
}

export function saveAs(filename, notebook) {
  return (subject, dispatch) => {
    subject.next({
      type: CHANGE_FILENAME,
      filename,
    });
    dispatch(save(filename, notebook));
  };
}

export function setNotebook(nbData) {
  return (subject, dispatch) => {
    const data = Immutable.fromJS(nbData);
    subject.next({
      type: SET_NOTEBOOK,
      data,
    });

    // Get the kernel name from the kernelspec, fallback on language_info, and
    // in the worse case scenario spawn a Python 3 kernel.
    const kernelName = data.getIn([
      'metadata', 'kernelspec', 'name',
    ], data.getIn([
      'metadata', 'language_info', 'name',
    ], 'python3'));
    dispatch(newKernel(kernelName));
  };
}

export function updateCellSource(id, source) {
  return {
    type: UPDATE_CELL_SOURCE,
    id,
    source,
  };
}

export function updateCellOutputs(id, outputs) {
  return {
    type: UPDATE_CELL_OUTPUTS,
    id,
    outputs,
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: MOVE_CELL,
    id,
    destinationId,
    above,
  };
}

export function removeCell(id) {
  return {
    type: REMOVE_CELL,
    id,
  };
}

export function createCellAfter(cellType, id) {
  return {
    type: NEW_CELL_AFTER,
    cellType,
    id,
  };
}

export function createCellBefore(cellType, id) {
  return {
    type: NEW_CELL_BEFORE,
    cellType,
    id,
  };
}

export function createCellAppend(cellType) {
  return {
    type: NEW_CELL_APPEND,
    cellType,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function executeCell(id, source) {
  return (subject, dispatch, state) => {
    const obs = agendas.executeCell(id, source)(state.channels);
    obs.subscribe(action => {
      subject.next(action);
    }, (error) => {
      subject.next({ type: ERROR_KERNEL_NOT_CONNECTED, message: error });
    });
  };
}
