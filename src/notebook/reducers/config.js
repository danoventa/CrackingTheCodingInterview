import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  [constants.SET_CONFIG_KEY]: function setConfigKey(state, action) {
    const { key, value } = action;
    return state.set(key, value);
  },
  [constants.MERGE_CONFIG]: function mergeConfig(state, action) {
    const { config } = action;
    return state.merge(config);
  },
}, {});
