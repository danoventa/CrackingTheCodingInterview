import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  // No one is using this --> we merely need a consistent structure
  [constants.REGISTER_COMM_TARGET]: function registerCommTarget(state, action) {
    return state.setIn(['targets', action.name], action.handler);
  },
}, {});
