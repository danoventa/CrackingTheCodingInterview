import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  [constants.REGISTER_COMM_TARGET]: function registerCommTarget(state, action) {
    return state.setIn(['targets', action.name], action.handler);
  },
}, {});
