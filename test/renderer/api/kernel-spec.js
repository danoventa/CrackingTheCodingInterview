import { expect } from 'chai';

import {
  launchKernel,
  shutdownKernel,
  forceShutdownKernel,
} from '../../../src/notebook/api/kernel';

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
});
