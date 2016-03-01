import BrowserWindow from 'browser-window';

import path from 'path';

export function launch(notebook) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    // frame: false,
    darkTheme: true,
    title: !notebook ? 'Untitled' : path.relative('.', notebook.replace(/.ipynb$/, '')),
  });

  const index = path.join(__dirname, '..', 'index.html');

  notebook = notebook || '';
  win.loadURL(`file://${index}#${encodeURIComponent(notebook)}`);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}

export function launchNewNotebook(kernelspec) {
  // TODO: This needs to create a new notebook using the kernelspec that
  // was specified
  launch();
}
