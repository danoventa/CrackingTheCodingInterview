import {
  forceShutdownKernel,
} from './kernel/shutdown';

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
  forceShutdownKernel(kernel);
}

export function initGlobalHandlers(store) {
  global.window.onunload = unload.bind(null, store);
}
