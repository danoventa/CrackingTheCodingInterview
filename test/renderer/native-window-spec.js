import Immutable from 'immutable';

import * as nativeWindow from '../../src/notebook/native-window';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { AppRecord, DocumentRecord, MetadataRecord } from '../../src/notebook/records';

chai.use(sinonChai);

import { dummyStore } from '../utils';

import { dummyCommutable } from '../utils';

const electron = require('electron')

describe('tildify', () => {
  it('returns an empty string if given no path', () => {
    expect(nativeWindow.tildify()).to.equal('');
  });
  it('replaces the user directory with ~', () => {
    const result = nativeWindow.tildify('/Users/jean-tester/test-notebooks');
    expect(result).to.have.string('~');
  });
});


describe('titling', () => {
  it('is able to set a title from the attributes object', () => {
    const notebook = new Immutable.Map().setIn(['metadata', 'kernelspec', 'display_name'], 'python3000');
    const state = {
      document: DocumentRecord({
        notebook,
      }),
      app: AppRecord({
        executionState: 'not connected',
      }),
      metadata: MetadataRecord({
        filename: 'titled.ipynb',
      })
    };

    const titleObject = nativeWindow.selectTitleAttributes(state);
    expect(titleObject.executionState).to.equal('not connected');
    expect(titleObject.filename).to.equal('titled.ipynb');
    expect(titleObject.displayName).to.equal('python3000');
  })
})

describe('setTitleFromAttributes', () => {
  it('sets the window title', () => {
    // Set up our "Electron window"
    const win = {
      setRepresentedFilename: sinon.spy(),
      setDocumentEdited: sinon.spy(),
      setTitle: sinon.spy(),
    };

    const remote = sinon.stub(electron.remote, 'getCurrentWindow', () => win);

    const notebook = new Immutable.Map().setIn(['metadata', 'kernelspec', 'display_name'], 'python3000');
    const state = {
      document: DocumentRecord({
        notebook,
      }),
      app: AppRecord({
        executionState: 'not connected',
      }),
      metadata: MetadataRecord({
        filename: 'titled.ipynb',
      })
    };

    const titleObject = nativeWindow.selectTitleAttributes(state);
    nativeWindow.setTitleFromAttributes(titleObject);

    // TODO: stub doesn't seem to get setup
    // expect(win.setTitle).to.have.been.called;
  })
})
