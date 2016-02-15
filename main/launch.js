import BrowserWindow from 'browser-window';

import path from 'path';

export default function launch(notebook) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    // frame: false,
    darkTheme: true,
    title: path.relative('.', notebook.replace(/.ipynb$/,''))
  });

  const index = path.join(__dirname, '..', 'index.html');

  win.loadURL(`file://${index}#${encodeURIComponent(notebook)}`);
  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
  return win;
}
