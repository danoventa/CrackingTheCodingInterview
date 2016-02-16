import * as commutable from 'commutable';
import * as fs from 'fs';

import { showDialog, save } from '../api/save';

export const reducers = {
  READ_JSON: (state, action) => {
    const { data } = action;
    const fetchedNotebook = commutable.fromJS(data);
    return Object.assign({}, state, {
      notebook: fetchedNotebook,
    });
  },
  UPDATE_CELL_EXECUTION_COUNT: (state, action) => {
    const { id, count } = action;
    const { notebook } = state;
    const updatedNotebook = notebook.setIn(['cellMap', id, 'execution_count'], count);
    return Object.assign({}, state, {
      notebook: updatedNotebook,
    });
  },
  UPDATE_CELL_SOURCE: (state, action) => {
    const { id, source } = action;
    const { notebook } = state;
    const updatedNotebook = notebook.setIn(['cellMap', id, 'source'], source);
    return Object.assign({}, state, {
      notebook: updatedNotebook,
    });
  },
  UPDATE_CELL_OUTPUTS: (state, action) => {
    const { id, outputs } = action;
    const { notebook } = state;
    const updatedNotebook = notebook.setIn(['cellMap', id, 'outputs'], outputs);
    return Object.assign({}, state, {
      notebook: updatedNotebook,
    });
  },
  SET_SELECTED: (state, action) => {
    const selected = action.additive ?
        state.selected.concat(action.ids) :
        action.ids;
    return Object.assign({}, state, {
      selected,
    });
  },
  MOVE_CELL: (state, action) => {
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
  },
  NEW_KERNEL: (state, action) => {
    const { channels, connectionFile, spawn } = action;
    state.channels = channels;
    state.connectionFile = connectionFile;
    state.spawn = spawn;
    return state;
  },
  EXIT: state => {
    close();
    return state;
  },
  KILL_KERNEL: state => {
    if (state.channels) {
      state.channels.shell.complete();
      state.channels.iopub.complete();
      state.channels.stdin.complete();
      state.channels = null;
    }
    if (state.spawn) {
      state.spawn.kill();
      state.spawn = null;
    }
    if (state.connectionFile) {
      fs.unlink(state.connectionFile);
      state.connectionFile = null;
    }
    return state;
  },
  CHANGE_FILENAME: state => {
    const newName = showDialog(state.filename);
    if (!newName) {
      return state;
    }

    state.filename = newName;
    return state;
  },
  CHECK_FILENAME: state => {
    if (state.filename) {
      return state;
    }

    const newName = showDialog();
    if (!newName) {
      return state;
    }

    state.filename = newName;
    return state;
  },
  START_SAVE: state => {
    if (state.filename) {
      save(state.filename, state.notebook);
    }
    return state;
  },
};
