import Rx from 'rx';

import { getJSON } from '../api';

export const subjects = {
  readJSONSubject: new Rx.Subject(),
  updateCellSubject: new Rx.Subject(),
};

export const readJSON = (filePath) =>
  Rx.Observable.fromPromise(getJSON(filePath))
    .subscribe(data => subjects.readJSONSubject.onNext(data));

export const updateCell = (notebook, index, cell) =>
  subjects.updateCellSubject.onNext(notebook, index, cell);
