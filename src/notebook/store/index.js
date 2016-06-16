import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';
// import createLogger from 'redux-logger';
import rootReducer from '../reducers';

// const logger = createLogger();

const exposeState = store => next => action => {
  return next(Object.assign({}, action, {
    getState: store.getState,
  }));
};

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(reduxObservable(), exposeState)
  );
}
