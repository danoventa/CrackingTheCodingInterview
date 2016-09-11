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
  expect(load('mytest.ipynb')).to.deep.equal({ type: 'LOAD', filename: 'mytest.ipynb' })
})

describe('newNotebook', () => {
  expect(newNotebook('python3', '/tmp'))
    .to.deep.equal({
      type: 'NEW_NOTEBOOK',
      kernelSpecName: 'python3',
      cwd: '/tmp',
    })
})

describe('notebookLoaded', () => {
  expect(notebookLoaded('test', dummyCommutable))
    .to.deep.equal({
      type: 'SET_NOTEBOOK',
      filename: 'test',
      notebook: dummyCommutable,
    })
})

describe('extractNewKernel', () => {
  expect(extractNewKernel('/tmp/test.ipynb', dummyCommutable)).to.deep.equal({
    type: 'LAUNCH_KERNEL',
    kernelSpecName: 'python3',
    cwd: '/tmp',
  })
})

describe('convertRawNotebook', () => {
  const converted = convertRawNotebook({
    filename: '/tmp/test.ipynb',
    data: dummy,
  });
  expect(converted.filename).to.equal('/tmp/test.ipynb');

  const notebook = converted.notebook;
  expect(notebook.get('metadata').toJS())
    .to.deep.equal(dummyCommutable.get('metadata').toJS());
})
