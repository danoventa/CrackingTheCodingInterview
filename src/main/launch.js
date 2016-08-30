import path from 'path';

import { shell, BrowserWindow } from 'electron';

import { emptyNotebook, emptyCodeCell, appendCell, fromJS } from 'commutable';
import * as immutable from 'immutable';
import fs from 'fs';

const log = require('electron-log');

export function deferURL(event, url) {
  event.preventDefault();
  shell.openExternal(url);
}

export function launch(notebook, filename) {
  let iconPath = '';
  if (process.argv[0].match(/electron/i)) {
    iconPath = './static/icon.png';
  } else {
    iconPath = '.cd/resources/app/static/icon.png';
  }

  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    title: !filename ? 'Untitled' : path.relative('.', filename.replace(/.ipynb$/, '')),
    icon: iconPath,
  });

  const index = path.join(__dirname, '..', '..', 'static', 'index.html');
  win.loadURL(`file://${index}`);

  // When the page finishes loading, send the notebook data via IPC
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main:load', { notebook: notebook.toJS(), filename });
  });

  win.webContents.on('will-navigate', deferURL);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export function launchNewNotebook(kernelspec) {
  const starterNotebook = appendCell(emptyNotebook, emptyCodeCell);

  let nb = starterNotebook;

  if (kernelspec && kernelspec.name && kernelspec.spec
                 && kernelspec.spec.language && kernelspec.spec.display_name) {
    nb = starterNotebook.setIn(['metadata', 'kernelspec'], immutable.fromJS({
      name: kernelspec.name,
      language: kernelspec.spec.language,
      display_name: kernelspec.spec.display_name,
    }));
  }

  return Promise.resolve(launch(nb));
}

export function launchFilename(filename) {
  if (!filename) {
    const warning = 'WARNING: launching a notebook with no filename and no kernelspec';
    log.info(warning); // Since it's not really a warning, this is our default case
    console.warn(warning);
    return Promise.resolve(launchNewNotebook());
  }

  return new Promise((resolve, reject) => {
    fs.readFile(filename, {}, (err, data) => {
      if (err) {
        reject(err);
        const warning = 'Filename not resolved, launching an empty Notebook.';
        // TODO: This should open a new notebook with the given filename
        log.warn(warning);
        console.warn(warning);
        launchNewNotebook('python3');
      } else {
        resolve(launch(fromJS(JSON.parse(data)), filename));
      }
    });
  });
}
