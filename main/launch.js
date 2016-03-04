import BrowserWindow from 'browser-window';
import path from 'path';

import { emptyNotebook, emptyCodeCell, appendCell, fromJS } from 'commutable';
import * as immutable from 'immutable';
import fs from 'fs';

export function launch(notebook, filename) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    // frame: false,
    darkTheme: true,
    title: !filename ? 'Untitled' : path.relative('.', filename.replace(/.ipynb$/, '')),
  });

  const index = path.join(__dirname, '..', 'index.html');
  win.loadURL(`file://${index}`);

  // When the page finishes loading, send the notebook data via IPC
  win.webContents.on('did-finish-load', function() {
    win.webContents.send('main:load', { notebook: notebook.toJS(), filename });
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export function launchNewNotebook(kernelspec) {
  // TODO: This needs to create a new notebook using the kernelspec that
  // was specified
  return Promise.resolve(launch(
    appendCell(emptyNotebook, emptyCodeCell)
      .set('kernelspec', immutable.fromJS(kernelspec))));
}

export function launchFilename(filename) {
  if (!filename) {
    return Promise.resolve(launchNewNotebook());
  }

  return new Promise((resolve, reject) => {
    fs.readFile(filename, {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(launch(fromJS(JSON.parse(data)), filename));
      }
    });
  });

}
