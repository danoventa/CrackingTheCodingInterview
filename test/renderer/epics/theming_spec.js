import { expect } from 'chai';

import {
  setTheme,
} from '../../../src/notebook/epics/theming';

describe('setTheme', () => {
  it('creates an action of type SET_THEME with a theme', () => {
    expect(setTheme('disco')).to.deep.equal({type: 'SET_THEME', theme: 'disco'})
  });
});
