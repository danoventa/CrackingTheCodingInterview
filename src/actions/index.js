import { getJSON } from '../api';

import { launchKernel } from '../api/kernel';

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

export function updateCellExecutionCount(id, count) {
  return {
    type: 'UPDATE_CELL_EXECUTION_COUNT',
    id,
    count,
  };
}

export function executeCell(id, source, dispatch, channels) {
  return () => {
    // TODO: figure out where channels come from
    const { iopub, shell } = channels;

    if(!iopub || !shell) {
      // TODO: propagate error about execution when kernel not connected
      return;
    }

    const executeRequest = createExecuteRequest(source);

    // Limitation of the Subject implementation in enchannel
    // we must shell.subscribe in order to shell.next
    shell.subscribe(() => {});

    // Set the current outputs to an empty list
    dispatch(updateCellOutputs(id, new Immutable.List()));

    const childMessages = iopub.childOf(executeRequest)
                               .publish()
                               .refCount();

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
