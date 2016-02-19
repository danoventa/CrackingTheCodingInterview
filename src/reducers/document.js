import * as commutable from 'commutable';

export function loadNotebook(state, action) {
  const { data } = action;
  const fetchedNotebook = commutable.fromJS(data);
  return Object.assign({}, state, {
    notebook: fetchedNotebook,
  });
}

export function updateExecutionCount(state, action) {
  const { id, count } = action;
  const { notebook } = state;
  const updatedNotebook = notebook.setIn(['cellMap', id, 'execution_count'], count);
  return Object.assign({}, state, {
    notebook: updatedNotebook,
  });
}
