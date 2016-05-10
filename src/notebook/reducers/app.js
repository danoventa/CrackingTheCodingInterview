import * as constants from '../constants';
import { mark } from '../performance';

import {
  shutdownKernel,
} from '../api/kernel';

function cleanupKernel(state) {
  mark('cleanupKernel:start');
  const kernel = {
    channels: state.channels,
    spawn: state.spawn,
    connectionFile: state.connectionFile,
  };
  shutdownKernel(kernel);

  const cleanState = {
    ...state,
    channels: null,
    spawn: null,
    connectionFile: null,
    executionState: 'not connected',
  };

  mark('cleanupKernel:end');
  return cleanState;
}

export default {
  [constants.NEW_KERNEL]: function newKernel(state, action) {
    mark('newKernel');
    const { channels, connectionFile, spawn } = action;

    return {
      ...cleanupKernel(state),
      channels,
      connectionFile,
      spawn,
      executionState: 'starting',
    };
  },
  [constants.EXIT]: function exit(state) {
    mark('exit');
    return cleanupKernel(state);
  },
  [constants.KILL_KERNEL]: cleanupKernel,
  [constants.START_SAVING]: function startSaving(state) {
    mark('startSaving');
    return { ...state, isSaving: true };
  },
  [constants.ERROR_KERNEL_NOT_CONNECTED]: function alertKernelNotConnected(state) {
    mark('alertKernelNotConnected');
    return { ...state, error: 'Error: We\'re not connected to a runtime!' };
  },
  [constants.SET_EXECUTION_STATE]: function setExecutionState(state, action) {
    mark('setExecutionState');
    const { executionState } = action;
    return { ...state, executionState };
  },
  [constants.DONE_SAVING]: function doneSaving(state) {
    mark('doneSaving');
    return { ...state, isSaving: false };
  },
  [constants.CHANGE_FILENAME]: function changeFilename(state, action) {
    mark('changeFilename');
    const { filename } = action;
    if (!filename) {
      return state;
    }
    return { ...state, filename };
  },
};
