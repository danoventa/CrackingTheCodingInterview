import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  [constants.CHANGE_FILENAME]: function changeFilename(state, action) {
    return state.set('filename', action.filename);
  },
}, {});
