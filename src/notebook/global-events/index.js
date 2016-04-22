import {
  shutdownKernel,
} from '../reducers/app';

/**
export function beforeUnload(store, dispatch, e) {
}
*/

export function unload(store) {
  // Note that the full signature is (store, dispatch, e)
  // though we only use store here as shutdown is required to be an immediate action
  const state = store.getState();
  shutdownKernel(state.channels, state.spawn, state.connectionFile);
}

export function initGlobalHandlers(store, dispatch) {
  // TODO: use beforeunload to ask user to save
  // global.window.onbeforeunload = beforeUnload.bind(null, store, dispatch);
  global.window.onunload = unload.bind(null, store, dispatch);
}
