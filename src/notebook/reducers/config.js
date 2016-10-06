import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  [constants.SET_KEY]: function setKey(state, action) {
    const { key, value } = action;
    return state.set(key, value);
  },
  [constants.SET_CONFIG]: function setConfig(state, action) {
    const { config } = action;
    return state.merge(config);
  },
}, {});
