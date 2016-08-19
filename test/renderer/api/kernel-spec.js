const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;

const fs = require('fs');

import {
  shutdownKernel,
  forceShutdownKernel,
  cleanupKernel,
} from '../../../src/notebook/api/kernel';

import reducers from '../../../src/notebook/reducers';
import * as constants from '../../../src/notebook/constants';
import { AppRecord } from '../../../src/notebook/records';

const emptyKernel = Object.freeze({
  channels: {
    shell: {},
    iopub: {},
    control: {},
    stdin: {},
  },
  spawn: {
    stdin: {},
    stdout: {},
    stderr: {},
  },
  connectionFile: '/tmp/connection.json',
})

function setupMockKernel() {
  const kernel = Object.assign({}, emptyKernel);
  kernel.channels.shell.complete = sinon.spy()
  kernel.channels.iopub.complete = sinon.spy()
  kernel.channels.control.complete = sinon.spy()
  kernel.channels.stdin.complete = sinon.spy()

  kernel.spawn.stdin.destroy = sinon.spy()
  kernel.spawn.stdout.destroy = sinon.spy()
  kernel.spawn.stderr.destroy = sinon.spy()

  kernel.spawn.kill = sinon.spy()

  return kernel;
}

describe('forceShutdownKernel', () => {
  it('fully cleans up the kernel and uses SIGKILL', () => {
    const kernel = setupMockKernel();

    const mockFs = {
      unlinkSync: sinon.spy(),
    };

    forceShutdownKernel(kernel, mockFs);

    expect(kernel.channels.shell.complete).to.have.been.called;
    expect(kernel.channels.iopub.complete).to.have.been.called;
    expect(kernel.channels.control.complete).to.have.been.called;
    expect(kernel.channels.stdin.complete).to.have.been.called;

    expect(kernel.spawn.stdin.destroy).to.have.been.called;
    expect(kernel.spawn.stdout.destroy).to.have.been.called;
    expect(kernel.spawn.stderr.destroy).to.have.been.called;

    expect(kernel.spawn.kill).to.have.been.calledWith('SIGKILL');

    // TODO: expect kernel.connectionFile to have called out to fs
    expect(mockFs.unlinkSync).to.have.been.calledWith(kernel.connectionFile);
  })
})

describe('cleanupKernel', () => {
  it('cleans out artifacts from the kernel object', () => {
    const kernel = setupMockKernel();

    const mockFs = {
      unlinkSync: sinon.spy(),
    };

    cleanupKernel(kernel, true, mockFs);

    expect(kernel.channels.shell.complete).to.have.been.called;
    expect(kernel.channels.iopub.complete).to.have.been.called;
    expect(kernel.channels.control.complete).to.have.been.called;
    expect(kernel.channels.stdin.complete).to.have.been.called;

    expect(kernel.spawn.stdin.destroy).to.have.been.called;
    expect(kernel.spawn.stdout.destroy).to.have.been.called;
    expect(kernel.spawn.stderr.destroy).to.have.been.called;

    expect(kernel.spawn.kill).to.not.have.been.called;

    // TODO: expect kernel.connectionFile to have called out to fs
    expect(mockFs.unlinkSync).to.have.been.calledWith(kernel.connectionFile);
  })
})

describe('shutdownKernel', () => {
})
