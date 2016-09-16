import { expect } from 'chai';

import {
  setTheme,
  setStoredThemeObservable,
} from '../../../src/notebook/epics/theming';

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
});
