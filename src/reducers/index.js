import * as commutable from 'commutable';

export const reducers = {
  READ_JSON: (state, action) => {
    const { data } = action;
    const fetchedNotebook = commutable.fromJS(data);
    return Object.assign({}, state, {
      notebook: fetchedNotebook,
    });
  },
  UPDATE_CELL: (state, action) => {
    const { notebook, index, cell } = action;
    const updatedNotebook = notebook.setIn(['cells', index, 'source'], cell);
    return Object.assign({}, state, {
      notebook: updatedNotebook,
    });
  },
};
