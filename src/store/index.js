import * as commutable from 'commutable';

import { actions } from '../actions';

export default function createStore(initialState) {

  const store = actions.scan(
    (state, action) => {
      switch (action.type) {
      case 'READ_JSON':
        const { data } = action;
        const fetchedNotebook = commutable.fromJS(data);
        return Object.assign({}, state, {
          notebook: fetchedNotebook,
        });
        return state;
      case 'UPDATE_CELL':
        const { notebook, index, cell } = action;
        const updatedNotebook = notebook.setIn(['cells', index, 'source'], cell);
        return Object.assign({}, state, {
          notebook: updatedNotebook,
        });
      }
    },
    initialState || {}
  );

  return store;
}
