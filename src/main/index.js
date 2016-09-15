import { Menu, dialog, app, ipcMain as ipc } from 'electron';
import { resolve } from 'path';

import Rx from 'rxjs/Rx';

import {
  launch,
  launchNewNotebook,
} from './launch';

import { defaultMenu, loadFullMenu } from './menu';

const log = require('electron-log');

const kernelspecs = require('kernelspecs');

const version = require('../../package.json').version;

const argv = require('yargs')
  .version(version)
  .parse(process.argv.slice(2));

const notebooks = argv._;

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipc.on('new-kernel', (event, newKernel) => {
  launchNewNotebook(newKernel);
});

ipc.on('open-notebook', (event, filename) => {
  launch(resolve(filename));
});

const appReady$ = Rx.Observable.fromEvent(app, 'ready');

const openFile$ = Rx.Observable.fromEvent(
  app,
  'open-file', (event, path) => ({ event, path })
);

function openFileFromEvent({ event, path }) {
  event.preventDefault();
  launch(resolve(path));
}

const kernelSpecsPromise = kernelspecs.findAll();

// Since we can't launch until app is ready
// and OS X will send the open-file events early,
// buffer those that come early.
openFile$
  .buffer(appReady$) // Form an array of open-file events from before app-ready
  .first() // Should only be the first
  .subscribe(buffer => {
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events
    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info('launching an empty notebook by default');
      kernelSpecsPromise.then(specs =>
        launchNewNotebook(Object.keys(specs)[0])
      );
    } else {
      notebooks
        .filter(Boolean)
        .filter(x => x !== '.') // Ignore the `electron .`
        // TODO: Consider opening something for directories
        .forEach(f => launch(resolve(f)));
    }
    buffer.forEach(openFileFromEvent);
  });

// All open file events after app is ready
openFile$
  .skipUntil(appReady$)
  .subscribe(openFileFromEvent);

appReady$
  .subscribe(() => {
    kernelSpecsPromise.then(kernelSpecs => {
      if (Object.keys(kernelSpecs).length !== 0) {
        // Get the default menu first
        Menu.setApplicationMenu(defaultMenu);
        // Let the kernels/languages come in after
        loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
      } else {
        dialog.showMessageBox({
          type: 'warning',
          title: 'No Kernels Installed',
          buttons: [],
          message: 'No kernels are installed on your system.',
          detail: 'No kernels are installed on your system so you will not be ' +
            'able to execute code cells in any language. You can read about ' +
            'installing kernels at ' +
            'https://ipython.readthedocs.io/en/latest/install/kernel_install.html',
        }, (index) => {
          if (index === 0) {
            app.quit();
          }
        });
      }
    }).catch(err => {
      dialog.showMessageBox({
        type: 'error',
        title: 'No Kernels Installed',
        buttons: [],
        message: 'No kernels are installed on your system.',
        detail: 'No kernels are installed on your system so you will not be ' +
          'able to execute code cells in any language. You can read about ' +
          'installing kernels at ' +
          'https://ipython.readthedocs.io/en/latest/install/kernel_install.html' +
          `\nFull error: ${err.message}`,
      }, (index) => {
        if (index === 0) {
          app.quit();
        }
      });
    });
  });
