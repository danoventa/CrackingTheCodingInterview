import { expect } from 'chai';

import {
  launchKernel,
  shutdownKernel,
  forceShutdownKernel,
} from '../../../src/notebook/api/kernel';

import reducers from '../../../src/notebook/reducers';
import * as constants from '../../../src/notebook/constants';
import { AppRecord } from '../../../src/notebook/records';

describe('the circle of life', () => {
  it('is available for creating and destroying kernels', () => {
    const kernelPromise = launchKernel('python2');

    return kernelPromise.then(kernel => {
      expect(kernel.channels).to.not.be.undefined;
      return shutdownKernel(kernel).then(() => {
        expect(kernel.channels).to.be.undefined;
      });
    })
  });
  it('is available for creating and force shutting down kernels', () => {
    const kernelPromise = launchKernel('python2');

    return kernelPromise.then(kernel => {
      expect(kernel.channels).to.not.be.undefined;
      forceShutdownKernel(kernel);
      expect(kernel.channels).to.be.undefined;
    })
  });
  it('can be interrupted', () => {
    const kernelPromise = launchKernel('python2');

    return kernelPromise.then(kernel => {
      const originalState = {
        app: new AppRecord(kernel),
      };

      const action = {
        type: constants.INTERRUPT_KERNEL,
      };

      const state = reducers(originalState, action);
      expect(state.app.spawn.connected).to.be.false;
      shutdownKernel(kernel);
    });
  });
});
