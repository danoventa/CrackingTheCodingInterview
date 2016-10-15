import { expect } from 'chai';

import { launchNewNotebook } from '../../app/build/main/launch';

const ipc = require('electron').ipcMain;

describe('launchNewNotebook', () => {
  it('launches a kernel', function(done) {
    // Note that we can't use => functions because we need `this` to be mocha's
    this.timeout(10000);

    ipc.on('nteract:ping:kernel', (event, kernel) => {
      win.close();
      expect(kernel).to.equal('python3');
      done();
    });

    const win = launchNewNotebook('python3');
    win.hide(); // To make it nicer to run locally

    setTimeout(() => {
      expect.fail('nteract:ping:kernel', null, 'Expected nteract:ping:kernel to be sent from frontend');
      done();
    }, 8000)
  });
});
