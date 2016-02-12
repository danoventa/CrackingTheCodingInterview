
import * as actions from '../actions/index';
import { remote } from 'electron';
import { List } from 'immutable';

const Menu = remote.Menu;

// Export the default menu as a const.
import defaultMenu from './default';
export const DEFAULT_MENU = defaultMenu;

/**
 * Dispatch a menu action
 * @param  {Object|string} action   Action that should be dispatched
 * @param  {function} dispatch      Redux store dispatcher function
 * @return {undefined}
 */
function dispatchAction(action, dispatch) {
  const isString = (typeof action === 'string');
  const actionName = isString ? action : action.get('name');
  const actionArgs = isString ? [] : action.get('args', new List()).toJS();
  dispatch(actions[actionName].apply(null, actionArgs));
}

/**
 * Creates a menu template object from an immutable menu.
 * @param  {Immutable.Map} immutableMenu   menu definition
 * @param  {function}      dispatch        Redux store action dispater function
 * @return {object}        template        menu template object compatable with
 *                                         electron's menu API
 */
export function createMenuTemplate(immutableMenu, dispatch) {
  if (!immutableMenu) {
    return immutableMenu;
  }

  if (List.isList(immutableMenu)) {
    return immutableMenu.map(x => createMenuTemplate(x, dispatch)).toJS();
  }

  return immutableMenu
    .update('click', cb => cb ? cb : () => {
      const action = immutableMenu.get('action');
      if (List.isList(action)) {
        action.map(x => dispatchAction(x, dispatch));
      } else if (action) {
        dispatchAction(action, dispatch);
      }
    })
    .update('submenu', submenu => createMenuTemplate(submenu, dispatch))
    .toJS();
}

/**
 * Sets the application menu
 * @param  {Map|Promise<Map>} asyncMenu  menu definition
 * @param  {function}         dispatch   Redux store action dispater function
 * @return {undefined}
 */
export function setApplicationMenu(asyncMenu, dispatch) {
  Promise.resolve(asyncMenu).then(menu => {
    const builtMenu = Menu.buildFromTemplate(createMenuTemplate(menu, dispatch));
    Menu.setApplicationMenu(builtMenu);
  });
}
