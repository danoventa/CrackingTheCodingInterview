import { expect } from 'chai';

import { ConfigRecord } from '../../../src/notebook/records';

import * as constants from '../../../src/notebook/constants';
import reducers from '../../../src/notebook/reducers';

describe('setKey', () => {
  it('sets the keys in the config', () => {
    const initialState = {
      config: new ConfigRecord({
        theme: null,
        sendMetrics: null,
      }),
    };

    const state = reducers(initialState, { type: constants.SET_KEY, key: 'theme', value: 'light' });
    expect(state.config.get('theme')).to.equal('light');
  });
});
