import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import { triggerModified } from './middlewares';
import rootReducer from './reducers';

import epics from './epics';

const rootEpic = combineEpics(...epics);

const middlewares = [
  createEpicMiddleware(rootEpic),
  triggerModified,
];

if (process.env.NODE_ENV === 'development') {
  const createLogger = require('redux-logger');  // eslint-disable-line

  const logger = createLogger();
  middlewares.push(logger);
}

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
