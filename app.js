// This gets bootstrapped by main.js
import app from 'app';

import launch from './main/launch';

import { Menu } from 'electron';
import { defaultMenu, loadFullMenu } from './main/menu';

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// First two arguments are Electron and main.js
// We'll assume the rest are the notebooks to be opened
const notebooks = process.argv.slice(2);
if(notebooks <= 0) {
  // default to the intro notebook for now
  notebooks.push('intro.ipynb');
}

app.on('ready', () => {
  // Get the default menu first
  Menu.setApplicationMenu(defaultMenu);
  // Let the kernels/languages come in after
  loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
  notebooks.forEach(launch);
});
