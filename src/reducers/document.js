import * as commutable from 'commutable';
import * as uuid from 'uuid';

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
  return Object.assign({}, state, {
    notebook: commutable.updateExecutionCount(notebook, id, count),
  });
}

export function moveCell(state, action) {
  const { notebook } = state;
  return Object.assign({}, state, {
    notebook: notebook.update('cellOrder', cellOrder => {
      const oldIndex = cellOrder.findIndex(id => id === action.id);
      const newIndex = cellOrder.findIndex(id => id === action.destinationId) + (action.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
    }),
  });
}

export function removeCell(state, action) {
  const { notebook } = state;
  const { id } = action;
  return Object.assign({}, state, {
    notebook: commutable.removeCell(notebook, id),
  });
}

export function newCellAfter(state, action) {
  // Draft API
  const { cellType, id } = action;
  const { notebook } = state;
  const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                         commutable.emptyCodeCell;
  const index = notebook.get('cellOrder').indexOf(id) + 1;
  const cellID = uuid.v4();
  return Object.assign({}, state, {
    notebook: commutable.insertCellAt(notebook, cell, cellID, index),
  });
}

export function updateSource(state, action) {
  const { id, source } = action;
  const { notebook } = state;
  return Object.assign({}, state, {
    notebook: commutable.updateSource(notebook, id, source),
  });
}

export function updateOutputs(state, action) {
  const { id, outputs } = action;
  const { notebook } = state;
  return Object.assign({}, state, {
    notebook: commutable.updateOutputs(notebook, id, outputs),
  });
}
