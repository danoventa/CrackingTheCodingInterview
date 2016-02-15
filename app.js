// This gets bootstrapped by main.js
import app from 'app';

import launch from './main/launch';

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
  notebooks.forEach(launch);
});
