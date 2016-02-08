
import actions from '../actions';
import { remote } from 'electron';

import defaultMenu from './default';
export const DEFAULT_MENU = defaultMenu;

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

export function createMenu(menuObject, dispatch, parentMenu) {
  if (!parentMenu) parentMenu = new Menu();

  if (Array.isArray(menuObject)) {
    menuObject.forEach(x => createMenu(x, dispatch, parentMenu));
  } else {
    const itemTemplate = {
      label: menuObject.label,
      click: () => {
        dispatch(actions[menuObject.action]());
      },
    };
    if (menuObject.submenu) {
      itemTemplate.submenu = createMenu(menuObject.submenu, dispatch);
    }

    parentMenu.append(new MenuItem(itemTemplate));
  }
}

export function setApplicationMenu(menuObject, dispatch) {
  Menu.setApplicationMenu(createMenu(menuObject, dispatch));
}
