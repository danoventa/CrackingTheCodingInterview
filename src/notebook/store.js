import { createStore, applyMiddleware } from 'redux';

import middlewares from './middlewares';
import rootReducer from './reducers';

if (process.env.NODE_ENV === 'development') {
  middlewares.push(require('./logger')()); // eslint-disable-line global-require
}

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
