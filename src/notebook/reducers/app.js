import { handleActions } from 'redux-actions';

import * as constants from '../constants';

import {
  shutdownKernel,
} from '../kernel/shutdown';

function cleanupKernel(state) {
  const kernel = {
    channels: state.channels,
    spawn: state.spawn,
    connectionFile: state.connectionFile,
  };
  shutdownKernel(kernel);

  return state.withMutations(ctx =>
    ctx.set('channels', null)
      .set('spawn', null)
      .set('connectionFile', null)
      .set('kernelSpecName', null)
      .set('executionState', 'not connected')
  );
}

export default handleActions({
  [constants.NEW_KERNEL]: function newKernel(state, action) {
    return cleanupKernel(state)
      .withMutations(ctx =>
        ctx.set('channels', action.channels)
          .set('connectionFile', action.connectionFile)
          .set('spawn', action.spawn)
          .set('kernelSpecName', action.kernelSpecName)
          .set('executionState', 'starting')
    );
  },
  [constants.EXIT]: function exit(state) {
    return cleanupKernel(state);
  },
  [constants.KILL_KERNEL]: cleanupKernel,
  [constants.INTERRUPT_KERNEL]: function interruptKernel(state) {
    state.spawn.kill('SIGINT');
    return state;
  },
  [constants.START_SAVING]: function startSaving(state) {
    return state.set('isSaving', true);
  },
  [constants.ERROR_KERNEL_NOT_CONNECTED]: function alertKernelNotConnected(state) {
    return state.set('error', 'Error: We\'re not connected to a runtime!');
  },
  [constants.SET_EXECUTION_STATE]: function setExecutionState(state, action) {
    return state.set('executionState', action.executionState);
  },
  [constants.DONE_SAVING]: function doneSaving(state) {
    return state.set('isSaving', false);
  },
  [constants.SET_NOTIFICATION_SYSTEM]: function setNotificationsSystem(state, action) {
    return state.set('notificationSystem', action.notificationSystem);
  },
  [constants.SET_MODIFIED]: function setModified(state, action) {
    const { value } = action;
    return state.set('modified', value);
  },
  [constants.SET_THEME]: function setTheme(state, action) {
    return state.set('theme', action.theme);
  },
  [constants.SET_GITHUB]: function setGithub(state, action) {
    return state.set('github', action.github);
  },
}, {});
