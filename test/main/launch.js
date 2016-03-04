import { expect } from 'chai';

import { launch, launchNewNotebook, launchFilename } from '../../main/launch';

function hasElement(contents, selector) {
  return new Promise(resolve => {
    contents.executeJavaScript(`return window.querySelector('${selector}') !== undefined;`, null, result => {
      resolve(result);
    });
  });
}

function waitFor(cb, timeout=5000) {
  return new Promise((resolve, reject) => {
    const check = () => {
      Promise.resolve(cb()).then(result => {
        if (result) {
          resolve();
        } else {
          setTimeout(check, 5); // 5ms poll rate
        }
      });
    };
    check();
    setTimeout(() => reject(new Error(`waitFor timeout of ${timeout}ms reached`)), timeout);
  });
}

describe('launch', () => {
  describe('launchNewNotebook', () => {
    it('launches a window', () => {
      return launchNewNotebook().then(win => {
        expect(win).to.not.be.undefined;
      });
    });
    // TODO: Get electron-compile working with electron-mocha
    // it('renders notebook', function() {
    //   // TODO: Re-enable mocha timeout for this test.
    //   this.timeout(0);
    //   return launchNewNotebook().then(win => {
    //     expect(win).to.not.be.undefined;
    //
    //     // Wait for the window to load.
    //     return new Promise(resolve => {
    //       win.webContents.on('did-finish-load', () => {
    //         resolve(win.webContents);
    //       });
    //     }).then(contents => {
    //
    //       // Wait for some content to be rendered by react.
    //       return waitFor(() => hasElement(contents, '.cell'));
    //     });
    //   });
    // });
  });
});
