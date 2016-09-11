import { expect } from 'chai';

import { launchNewNotebook } from '../../build/main/launch';
import {ipcMain as ipc} from 'electron';

describe('launch', () => {
  describe('launchNewNotebook', () => {
    it('launches a window', function(done) {
      this.timeout(7000);

      const win = launchNewNotebook('python3');
      ipc.on('nteract:ping:kernel', (kernel) => {
        win.close();
        expect(kernel).to.equal('python3');
        done();
      });

      setTimeout(() => {
        expect.fail('nteract:ping:kernel', null, 'Expected nteract:ping:kernel to be sent from frontend');
        done();
      }, 5000)
    });
  });
});
