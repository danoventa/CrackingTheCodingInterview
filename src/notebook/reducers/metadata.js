import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  [constants.CHANGE_FILENAME]: function changeFilename(state, action) {
    if (action.filename) {
      return state.set('filename', action.filename);
    }
    return state;
  },
}, {});
