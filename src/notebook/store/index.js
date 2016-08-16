import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { triggerUndo, triggerModified } from '../middlewares';
import rootReducer from '../reducers';

import { saveEpic, saveAsEpic } from '../epics/saving';

const epics = combineEpics(saveEpic, saveAsEpic);

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(createEpicMiddleware(epics), triggerUndo, triggerModified)
  );
}
