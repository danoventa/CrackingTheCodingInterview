import Rx from 'rx';

import { getJSON } from '../api';

export const actions = new Rx.Subject();

export const readJSON = (filePath) =>
  Rx.Observable.fromPromise(getJSON(filePath))
    .subscribe(data => actions.onNext(Object.assign({}, { type: 'READ_JSON' }, { data })));

export const updateCell = (notebook, index, cell) =>
  actions.onNext(Object.assign({}, { type: 'UPDATE_CELL' }, { notebook, index, cell }));
