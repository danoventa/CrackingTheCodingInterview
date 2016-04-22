import {
  shutdownKernel,
} from '../reducers/app';

/**
export function beforeUnload(store, dispatch, e) {
}
*/

export function unload(store, dispatch, e) {
  console.warn(e);
  const state = store.getState();
  shutdownKernel(state.channels, state.spawn, state.connectionFile);
}

export function initGlobalHandlers(store, dispatch) {
  // TODO: use beforeunload to ask user to save
  // global.window.onbeforeunload = beforeUnload.bind(null, store, dispatch);
  global.window.onunload = unload.bind(null, store, dispatch);
}
