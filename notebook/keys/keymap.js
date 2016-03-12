import * as actions from '../actions';
import KeymapManager from 'atom-keymap';

function registerListeners(window, dispatch) {
  if (!window) throw new Error('window not defined');
  if (!dispatch) throw new Error('dispatch not defined');

  // Register action event listeners on the window for every known action.
  Object.keys(actions).forEach(actionName => {
    window.addEventListener(`'action:${actionName}`, () => {
      try {
        dispatch(actions[actionName]());
      } catch (err) {
        console.error('key bound action invoke failure', actionName, err);
      }
    });
  });
}

export function initKeymap(window, dispatch) {
  registerListeners(window, dispatch);

  const document = window.document;
  const keymaps = new KeymapManager();
  keymaps.defaultTarget = document.body;
  document.addEventListener('keydown', event => keymaps.handleKeyboardEvent(event));

  // Add the keymap files, can also be specified as directories
  keymaps.add('/default-keymap', require('./default-map.json'));
  // keymaps.loadKeymap('/path/to/keymap-file.json');
}
