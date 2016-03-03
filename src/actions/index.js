import * as commutable from 'commutable';

import { launchKernel } from '../api/kernel';

import { writeFile } from 'fs';

import {
  EXIT,
  KILL_KERNEL,
  NEW_KERNEL,
  START_SAVING,
  DONE_SAVING,
  CHANGE_FILENAME,
  SET_SELECTED,
  UPDATE_CELL_SOURCE,
  UPDATE_CELL_OUTPUTS,
  MOVE_CELL,
  NEW_CELL_AFTER,
  REMOVE_CELL,
  SET_NOTEBOOK,
  UPDATE_CELL_EXECUTION_COUNT,
  ERROR_KERNEL_NOT_CONNECTED,
} from './constants';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../api/messaging';

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

export function save() {
  return (subject, dispatch, state) => {

    // If there isn't a filename, save-as it instead
    if (!state.filename) {
      const opts = {
        title: 'Save Notebook As',
        filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
      };
      dialog.showSaveDialog(opts, (filename) => {
        if(!filename) {
          return;
        }

        if (path.extname(filename) === '') {
          filename = filename + '.ipynb';
        }
        dispatch(saveAs(filename));
      });
      return;
    }

    subject.next({
      type: START_SAVING,
    });
    writeFile(state.filename, JSON.stringify(commutable.toJS(state.notebook), null, 2), (err) => {
      if(err) {
        console.error(err);
        throw err;
      }
      subject.next({
        type: DONE_SAVING,
      });
    });

  };
}

export function saveAs(filename) {
  return (subject, dispatch) => {
    subject.next({
      type: CHANGE_FILENAME,
      filename,
    });
    dispatch(save());
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
      'metadata', 'kernelspec', 'name'
    ], data.getIn([
      'metadata', 'language_info', 'name'
    ], 'python3'));
    dispatch(newKernel(kernelName));
  };
}

export function setSelected(ids, additive) {
  return {
    type: SET_SELECTED,
    ids,
    additive,
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

export function updateCellExecutionCount(id, count) {
  return {
    type: UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function executeCell(id, source) {
  return (subject, dispatch, state) => {
    const { iopub, shell } = state.channels;

    if(!iopub || !shell) {
      subject.next({ type: ERROR_KERNEL_NOT_CONNECTED });
      return;
    }

    const executeRequest = createExecuteRequest(source);

    // Limitation of the Subject implementation in enchannel
    // we must shell.subscribe in order to shell.next
    shell.subscribe(() => {});

    // Set the current outputs to an empty list
    dispatch(updateCellOutputs(id, new Immutable.List()));

    const childMessages = iopub.childOf(executeRequest)
                               .share();

    childMessages.ofMessageType(['execute_input'])
                 .pluck('content', 'execution_count')
                 .first()
                 .subscribe((ct) => {
                   dispatch(updateCellExecutionCount(id, ct));
                 });

    // Handle all the nbformattable messages
    childMessages
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
         .map(msgSpecToNotebookFormat)
         // Iteratively reduce on the outputs
         .scan((outputs, output) => {
           if(output.output_type === 'clear_output') {
             return new Immutable.List();
           }
           return outputs.push(Immutable.fromJS(output));
         }, new Immutable.List())
         // Update the outputs with each change
         .subscribe(outputs => {
           dispatch(updateCellOutputs(id, outputs));
         });

    shell.next(executeRequest);
  };
}
