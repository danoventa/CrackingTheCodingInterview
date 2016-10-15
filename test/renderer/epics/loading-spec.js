import { expect } from 'chai';

import {
  dummyCommutable,
  dummy,
} from '../dummy-nb';

import {
  load,
  newNotebook,
  notebookLoaded,
  extractNewKernel,
  convertRawNotebook,
} from '../../../src/notebook/epics/loading';

import Immutable from 'immutable';

describe('load', () => {
  it('loads a notebook', () => {
    expect(load('mytest.ipynb'))
      .to.deep.equal({ type: 'LOAD', filename: 'mytest.ipynb' })
  })
})

describe('newNotebook', () => {
  it('creates a new notebook', () => {
    expect(newNotebook('python3', '/tmp'))
      .to.deep.equal({
        type: 'NEW_NOTEBOOK',
        kernelSpecName: 'python3',
        cwd: '/tmp',
      })
  })
})

describe('notebookLoaded', () => {
  it('sets a notebook', () => {
    expect(notebookLoaded('test', dummyCommutable))
      .to.deep.equal({
        type: 'SET_NOTEBOOK',
        filename: 'test',
        notebook: dummyCommutable,
      })
  })
})

describe('extractNewKernel', () => {
  it('extracts and launches the kernel from a notebook', () => {
    expect(extractNewKernel('/tmp/test.ipynb', dummyCommutable)).to.deep.equal({
      type: 'LAUNCH_KERNEL',
      kernelSpecName: 'python3',
      cwd: '/tmp',
    })
  })
})

describe('convertRawNotebook', () => {
  it('converts a raw notebook', () => {
    const converted = convertRawNotebook({
      filename: '/tmp/test.ipynb',
      data: dummy,
    });
    expect(converted.filename).to.equal('/tmp/test.ipynb');

    const notebook = converted.notebook;
    expect(dummyCommutable.get('metadata').equals(notebook.get('metadata')))
      .to.be.true;
  })
})
