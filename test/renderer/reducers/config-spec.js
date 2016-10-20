import { expect } from 'chai';

import { ConfigRecord } from '../../../src/notebook/records';

import * as constants from '../../../src/notebook/constants';
import reducers from '../../../src/notebook/reducers';

describe('setKey', () => {
  it('sets the keys in the config', () => {
    const initialState = {
      config: new ConfigRecord({
        theme: null,
      }),
    };

    const state = reducers(initialState, {
      type: constants.SET_CONFIG_KEY,
      key: 'theme',
      value: 'light'
    });
    expect(state.config.get('theme')).to.equal('light');
  });
});

describe('mergeConfig', () => {
  it('sets the config', () => {
    const initialState = {
      config: new ConfigRecord(),
    };

    const config = { theme: 'dark' };
    const state = reducers(initialState, { type: constants.MERGE_CONFIG, config });
    expect(state.config.get('theme')).to.equal('dark');
  });
});
