import * as Rx from '@reactivex/rxjs';

import { getJSON } from '../api';

export const actions = new Rx.Subject();

export const readJSON = (filePath) =>
  Rx.Observable.fromPromise(getJSON(filePath))
    .subscribe(data => actions.next(Object.assign({}, { type: 'READ_JSON' }, { data })));

export const updateCell = (notebook, index, cell) =>
  actions.next(Object.assign({}, { type: 'UPDATE_CELL' }, { notebook, index, cell }));
