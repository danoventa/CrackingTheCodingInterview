import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { triggerUndo, triggerModified } from '../middlewares';
import rootReducer from '../reducers';

import { saveEpic, saveAsEpic } from '../epics/saving';

const epics = combineEpics(saveEpic, saveAsEpic);


const middlewares = [
  createEpicMiddleware(epics),
  triggerUndo,
  triggerModified,
];

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
