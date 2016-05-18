import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from 'redux-observable';
// import createLogger from 'redux-logger';
import rootReducer from '../reducers';

// const logger = createLogger();

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(reduxObservable()/* , logger */)
  );
}
