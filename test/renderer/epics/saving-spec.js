import { expect } from 'chai';

import {
  dummyCommutable
} from '../dummy-nb';


import {
  save,
  saveAs,
  SAVE,
  SAVE_AS,
} from '../../../src/notebook/epics/saving';


describe('save', () => {
  it('creates a SAVE action', () => {
    expect(save('test/test-save.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE,
        filename: 'test/test-save.ipynb',
        notebook: dummyCommutable,
    });
  });
});

describe('saveAs', () => {
  it('creates a SAVE_AS action', () => {
    expect(saveAs('test/test-saveas.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE_AS,
        filename: 'test/test-saveas.ipynb',
        notebook: dummyCommutable,
    });
  });
  it.skip('creates a CHANGE_FILENAME action', () => {
    // We need to test that the epic triggers a CHANGE_FILENAME
    expect.fail();
  });
});
