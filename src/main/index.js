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

log.info('args', process.argv);

const sliceAt = process.argv[0].match('nteract') ? 1 : 2;

const argv = require('yargs')
  .version(version)
  .parse(process.argv.slice(sliceAt));

const notebooks = argv._
  .filter(Boolean)
  .filter(x => /^(?!-)/.test(x)) // Ignore strangeness on OS X first launch
                                 // see #805
  .filter(x => x !== '.'); // Ignore the `electron .`
                           // TODO: Consider opening something for directories

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
      kernelSpecsPromise.then(specs => {
        const defaultKernel = 'python3';
        let kernel = defaultKernel;

        if ('python3' in specs) {
          kernel = 'python3';
        } else if ('python2' in specs) {
          kernel = 'python2';
        } else {
          const specList = Object.keys(specs);
          specList.sort();
          kernel = specList[0];
        }

        launchNewNotebook(kernel);
      }
      );
    } else {
      notebooks
        .forEach(f => {
          try {
            launch(resolve(f));
          } catch (e) {
            log.error(e);
            console.error(e);
          }
        });
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
