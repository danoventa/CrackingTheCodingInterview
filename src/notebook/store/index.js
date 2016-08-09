import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { triggerUndo, triggerModified } from '../middlewares';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(createEpicMiddleware(), triggerUndo, triggerModified)
  );
}
