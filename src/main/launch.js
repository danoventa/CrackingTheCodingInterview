import path from 'path';

import { shell, BrowserWindow } from 'electron';

export function deferURL(event, url) {
  event.preventDefault();
  shell.openExternal(url);
}

export function launch(filename) {
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
  win.webContents.on('dom-ready', () => {
    console.warn('dom ready');
    if (filename) {
      console.warn(filename);
      win.webContents.send('main:load', filename);
    }
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('load', filename);
  });

  win.webContents.on('will-navigate', deferURL);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export function launchNewNotebook(kernelspec) {
  const win = launch();
  win.webContents.on('dom-ready', () => {
    win.webContents.send('main:new', kernelspec);
  });
}
