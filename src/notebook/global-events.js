import {
  forceShutdownKernel,
} from './kernel/shutdown';

import {
  saveConfig,
} from './epics/config';

/**
export function beforeUnload(store, dispatch, e) {
}
*/

export function unload(store) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile,
  };
  saveConfig(state.config);
  forceShutdownKernel(kernel);
}

export function initGlobalHandlers(store) {
  // TODO: use beforeunload to ask user to save
  // global.window.onbeforeunload = beforeUnload.bind(null, store, dispatch);
  global.window.onunload = unload.bind(null, store);
}
