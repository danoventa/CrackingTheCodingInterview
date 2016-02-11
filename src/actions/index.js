import { getJSON } from '../api';

import { launchKernel } from '../api/kernel';

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
