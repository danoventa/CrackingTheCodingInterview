import {
  launchFilename,
  launchNewNotebook,
} from './launch';

import { Menu, app } from 'electron';
import { defaultMenu, loadFullMenu } from './menu';
import { resolve } from 'path';

const version = require('../../package.json').version;


const argv = require('yargs')
              .version(version)
              .parse(process.argv.slice(1));

const notebooks = argv._;

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('open-file', (event, path) => {
  event.preventDefault();
  launchFilename(resolve(path));
});

app.on('ready', () => {
  // Get the default menu first
  Menu.setApplicationMenu(defaultMenu);
  // Let the kernels/languages come in after
  loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
  if (notebooks.length <= 0) {
    launchNewNotebook('python3');
  } else {
    notebooks.filter(Boolean).forEach(f => launchFilename(resolve(f)));
  }
});
