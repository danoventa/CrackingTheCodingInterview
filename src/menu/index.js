
import * as actions from '../actions/index';
import { remote } from 'electron';
import { List } from 'immutable';

const Menu = remote.Menu;

// Export the default menu as a const.
import defaultMenu from './default';
export const DEFAULT_MENU = defaultMenu;

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
        action.map(x => dispatch(actions[x]()));
      } else if (action) {
        dispatch(actions[action]());
      }
    })
    .update('submenu', submenu => createMenuTemplate(submenu, dispatch))
    .toJS();
}

/**
 * Sets the application menu
 * @param  {Immutable.Map} immutableMenu   menu definition
 * @param  {function}      dispatch        Redux store action dispater function
 * @return {undefined}
 */
export function setApplicationMenu(immutableMenu, dispatch) {
  const menu = Menu.buildFromTemplate(createMenuTemplate(immutableMenu, dispatch));
  Menu.setApplicationMenu(menu);
}
