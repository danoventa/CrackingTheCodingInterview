import { expect } from 'chai';

import {
  launchKernel,
  shutdownKernel,
} from '../../../src/notebook/api/kernel';

describe('the circle of life', () => {
  it('is available for creating and destroying kernels', () => {
    const kernel = launchKernel('python');
    shutdownKernel(kernel.channels, kernel.connectionFile, kernel.spawn);
  });
});
