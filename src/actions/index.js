import { getJSON } from '../api';

export function readJSON(filePath) {
  return (subject) => {
    getJSON(filePath)
      .then((data) =>
        subject.next({
          type: 'READ_JSON',
          data,
        })
      );
  };
}

export function updateCell(notebook, index, cell) {
  return {
    type: 'UPDATE_CELL',
    notebook,
    index,
    cell,
  };
}
