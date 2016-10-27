import { handleActions } from 'redux-actions';

import * as constants from '../constants';

function changeFilename(state, action) {
  if (action.filename) {
    return state.set('filename', action.filename);
  }
  return state;
}

export default handleActions({
  [constants.CHANGE_FILENAME]: changeFilename,
  [constants.SET_NOTEBOOK]: changeFilename,
}, {});
