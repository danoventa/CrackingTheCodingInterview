import app from 'app';

import { launchFilename } from './launch';

import { Menu } from 'electron';
import { defaultMenu, loadFullMenu } from './menu';
import { resolve } from 'path';

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// First two arguments are Electron and main.js
// We'll assume the rest are the notebooks to be opened
const notebooks = process.argv.slice(2);
if (notebooks <= 0) {
  notebooks.push(null);
}

app.on('ready', () => {
  // Get the default menu first
  Menu.setApplicationMenu(defaultMenu);
  // Let the kernels/languages come in after
  loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
  notebooks.filter(Boolean).map(f => resolve(f)).forEach(launchFilename);
});
