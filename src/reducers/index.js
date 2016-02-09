import * as commutable from 'commutable';
import * as fs from 'fs';

export const reducers = {
  READ_JSON: (state, action) => {
    const { data } = action;
    const fetchedNotebook = commutable.fromJS(data);
    return Object.assign({}, state, {
      notebook: fetchedNotebook,
    });
  },
  UPDATE_CELL: (state, action) => {
    const { index, cell } = action;
    const { notebook } = state;
    const updatedNotebook = notebook.setIn(['cells', index, 'source'], cell);
    return Object.assign({}, state, {
      notebook: updatedNotebook,
    });
  },
  NEW_KERNEL: (state, action) => {
    const { channels, connectionFile, spawn } = action;
    // TODO: Close old channels, close old spawn, delete old connectionFile
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
};
