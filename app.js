// This gets bootstrapped by main.js
import app from 'app';
import BrowserWindow from 'browser-window';

import path from 'path';

let windows = [];

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // We're a single pane app for the moment, so we'll just close
  // instead of conditional closure on process.platform !== 'darwin'
  app.quit();
});

const notebooks = process.argv.slice(2);

if(notebooks <= 0) {
  // default to the intro notebook for now
  notebooks.push('intro.ipynb');
} 

app.on('ready', () => {
  windows = notebooks.forEach((notebook) => {
    let win = new BrowserWindow({
      width: 800,
      height: 1000,
      // frame: false,
      darkTheme: true,
      title: 'nteract',
    });

    const index = path.join(__dirname, '/index.html');

    win.loadURL(`file://${index}#${encodeURIComponent(notebook)}`);
    // Emitted when the window is closed.
    win.on('closed', () => {
      win = null;
    });
    return win;
  });
});
