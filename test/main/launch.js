import { expect } from 'chai';

import { launchNewNotebook } from '../../build/main/launch';
import {ipcMain as ipc} from 'electron';

describe('launch', () => {
  describe('launchNewNotebook', () => {
    it('launches a window', function() {
      // The render window may take a while to display on slow machines.
      // Set the timeout to 5s
      this.timeout(5000);

      return launchNewNotebook().then(win => {
        expect(win).to.not.be.undefined;
        return new Promise(resolve => {

          // Query selector all and make sure the length for .cells is
          // greater than 0.  Use IPC to return the results from the
          // render window.
          ipc.on('queryLength', function (event, value) {
            expect(value).to.be.greaterThan(0);
            resolve();
          });
          win.webContents.executeJavaScript(`
            var ipc = require('electron').ipc;
            ipc.send('queryLength', document.querySelectorAll('div.cell').length);
          `);
        });
      });
    });
  });
});
