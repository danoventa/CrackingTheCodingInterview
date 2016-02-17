import { getJSON } from '../api';

import * as commutable from 'commutable';

import { launchKernel } from '../api/kernel';

import { writeFile } from 'fs';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../api/messaging';

import Immutable from 'immutable';

export function exit() {
  return {
    type: 'EXIT',
  };
}

export function killKernel() {
  return {
    type: 'KILL_KERNEL',
  };
}

export function newKernel(kernelSpecName) {
  return (subject) => {
    launchKernel(kernelSpecName)
      .then(kc => {
        const { channels, connectionFile, spawn } = kc;
        subject.next({
          type: 'NEW_KERNEL',
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
    subject.next({
      type: 'START_SAVING',
    });
    // TODO: Pop up save as dialog if filename not set
    writeFile(state.filename, JSON.stringify(commutable.toJS(state.notebook), null, 2), (err) => {
      if(err) {
        // TODO: subject.next({ type: 'SAVING_ERROR'}) ?
        console.error(err);
        throw err;
      }
      subject.next({
        type: 'DONE_SAVING',
      });
    });

  };
}

export function saveAs(filename) {
  return (subject, dispatch) => {
    subject.next({
      type: 'CHANGE_FILENAME',
      filename,
    });
    dispatch(save());
  };
}

export function readJSON(filePath) {
  return (subject) => {
    getJSON(filePath)
      .then((data) => {
        subject.next({
          type: 'READ_JSON',
          data,
        });
        newKernel(data.metadata.kernelspec.name)(subject);
      });
  };
}

export function setSelected(ids, additive) {
  return {
    type: 'SET_SELECTED',
    ids,
    additive,
  };
}

export function updateCellSource(id, source) {
  return {
    type: 'UPDATE_CELL_SOURCE',
    id,
    source,
  };
}

export function updateCellOutputs(id, outputs) {
  return {
    type: 'UPDATE_CELL_OUTPUTS',
    id,
    outputs,
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: 'MOVE_CELL',
    id,
    destinationId,
    above,
  };
}

export function createCellAfterActive(cellType) {
  return {
    type: 'NEW_CELL_AFTER_ACTIVE',
    cellType,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: 'UPDATE_CELL_EXECUTION_COUNT',
    id,
    count,
  };
}

export function executeCell(id, source) {
  return (subject, dispatch, state) => {
    const { iopub, shell } = state.channels;

    if(!iopub || !shell) {
      // TODO: propagate error about execution when kernel not connected
      // IDEA: Propagage error via subject!
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
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error'])
         .map(msgSpecToNotebookFormat)
         // Iteratively reduce on the outputs
         .scan((outputs, output) => {
           return outputs.push(Immutable.fromJS(output));
         }, new Immutable.List())
         // Update the outputs with each change
         .subscribe(outputs => {
           dispatch(updateCellOutputs(id, outputs));
         });

    shell.next(executeRequest);

    // TODO: Manage subscriptions
  };
}
