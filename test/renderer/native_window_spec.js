import * as nativeWindow from '../../src/notebook/native-window';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { dummyStore } from '../utils';

import { dummyCommutable } from '../utils';

describe('tildify', () => {
  it('returns an empty string if given no path', () => {
    expect(nativeWindow.tildify()).to.equal('');
  });
  it('replaces the user directory with ~', () => {
    const result = nativeWindow.tildify('/Users/jean-tester/test-notebooks');
    expect(result).to.have.string('~');
  });
});


describe('titleFromState', () => {
  const store = dummyStore();
  const titleObject = nativeWindow.titleFromState(store.getState());

  expect(titleObject).to.deep.equal({
    title: 'dummy-store-nb.ipynb - ... - not connected ',
    path: 'dummy-store-nb.ipynb',
  });
})
