import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(reduxObservable())
  );
}
