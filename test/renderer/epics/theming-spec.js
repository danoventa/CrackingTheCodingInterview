import chai, { expect } from 'chai';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import {
  setTheme,
  setStoredThemeObservable,
} from '../../../src/notebook/epics/theming';

import storage from 'electron-json-storage';

describe('setTheme', () => {
  it('creates an action of type SET_THEME with a theme', () => {
    expect(setTheme('disco')).to.deep.equal({type: 'SET_THEME', theme: 'disco'})
  });
});

describe('setStoredThemeObservable', () => {
  it('returns an observable', () => {
    const setStoredThemeObs = setStoredThemeObservable('disco');
    expect(setStoredThemeObs.subscribe).to.not.be.null;
  });
  it('should set the value in the store', (done) => {
    const setStoredThemeObs = setStoredThemeObservable('disco');
    const set = sinon.spy(storage, 'set');

    setStoredThemeObs.subscribe(() => {
      expect(set).to.be.called;
      done();
    });
  });
  it('should return an error if not given a theme', (done) => {
    const setStoredThemeObs = setStoredThemeObservable();
    const set = sinon.spy(storage, 'set');

    setStoredThemeObs.subscribe(() => {
      throw new Error('Observable invalidly set theme.');
    }, (error) => {
      expect(set).to.be.called;
      expect(error.message).to.equal('Must provide JSON and key');
    });

    done();
  });
});
