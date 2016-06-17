import * as constants from '../constants';
import { setBackwardCheckpoint } from '../actions';
import { List } from 'immutable';

export const triggerUndo = store => next => action => {
  const undoable = new List([
      constants.REMOVE_CELL,
      constants.TOGGLE_STICKY_CELL,
      constants.MOVE_CELL,
      constants.NEW_CELL_APPEND,
      constants.NEW_CELL_AFTER,
      constants.NEW_CELL_BEFORE,
      constants.CLEAR_CELL_OUTPUT,
  ]);
  if (undoable.indexOf(action.type) !== -1) {
    store.dispatch(setBackwardCheckpoint(store.getState().document));
  }
  return next(action);
};
