import Immutable from 'immutable';

import { createStore, applyMiddleware } from 'redux';

import middlewares from './middlewares';
import rootReducer from './reducers';

if (process.env.NODE_ENV === 'development') {
  const createLogger = require('redux-logger');  // eslint-disable-line

  const logger = createLogger({
    stateTransformer: (state) =>
      Object.keys(state).reduce((prev, key) =>
        Object.assign(
          {},
          prev,
          { [key]: Immutable.Iterable.isIterable(state[key]) ? state[key].toJS() : state[key] }
        )
    , {}),
  });
  middlewares.push(logger);
}

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
