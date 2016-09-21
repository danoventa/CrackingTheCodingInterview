import { createStore, applyMiddleware } from 'redux';

import middlewares from './middlewares';
import rootReducer from './reducers';

if (process.env.DEBUG) {
  const logger = require('./logger'); // eslint-disable-line global-require

  middlewares.push(logger());
}

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
