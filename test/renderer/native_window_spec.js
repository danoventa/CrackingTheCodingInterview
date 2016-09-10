import * as nativeWindow from '../../src/notebook/native-window';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

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

describe('launchFilename', () => {
  it('should fail on an unavailable file', () => {
    const win = nativeWindow.launchFilename('test-notebook.ipynb');
    expect(win).to.be.rejected;
  });
});
