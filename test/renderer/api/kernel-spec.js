import { expect } from 'chai';

import {
  launchKernel,
  shutdownKernel,
} from '../../../src/notebook/api/kernel';

describe('the circle of life', () => {
  it('is available for creating and destroying kernels', () => {
    const kernelPromise = launchKernel('python3');

    return kernelPromise.then(kernel => {
      expect(kernel.spawn.killed).to.not.be.true;
      shutdownKernel(kernel);
      expect(kernel.spawn.killed).to.be.true;
    })
  });
});
