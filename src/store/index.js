import Rx from 'rx';
import * as commutable from 'commutable';

import { subjects } from '../actions';

export default function createStore(initialState) {

  let state = initialState || {};

  const stateSubject = new Rx.Subject();

  subjects.readJSONSubject.subscribe(
    data => {
      const fetchedNotebook = commutable.fromJS(data);
      state = Object.assign({}, state, {
        notebook: fetchedNotebook,
      });
      stateSubject.onNext(state);
    },
    err => {
      state = Object.assign({}, state, {
        err,
      });
      stateSubject.onNext(state);
    }
  );

  subjects.updateCellSubject.subscribe(
    (notebook, index, cell) => {
      const updatedNotebook = state.notebook ?
        state.notebook.setIn(['cells', index], cell) : null;
      state = Object.assign({}, state, {
        notebook: updatedNotebook,
      });
      stateSubject.onNext(state);
    }
  );

  return stateSubject;
}
