import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';
import rootReducer from '../reducers';

import * as constants from '../constants';
import { setBackwardCheckpoint } from '../actions';

const triggerUndo = store => next => action => {
  console.log('triggerUndo');
  if (action.type === constants.REMOVE_CELL) {
    store.dispatch(setBackwardCheckpoint(store.getState().document));
  }
  return next(action);
};

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(reduxObservable(), triggerUndo)
  );
}
