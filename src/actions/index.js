import { getJSON } from '../api';

import launchKernel from '../api/kernel';

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

export function openFile() {
  /* eslint no-alert: 0 */
  return readJSON(prompt('File path:'));
}

export function updateCell(notebook, index, cell) {
  return {
    type: 'UPDATE_CELL',
    notebook,
    index,
    cell,
  };
}
