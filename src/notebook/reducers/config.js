import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import * as constants from '../constants';

console.log(constants.SET_KEY);

export default handleActions({
  [constants.SET_KEY]: function setKey(state, action) {
    const { key, value } = action;
    return state.set(key, value);
  },
}, {});
