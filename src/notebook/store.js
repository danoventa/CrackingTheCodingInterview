import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { triggerUndo, triggerModified } from './middlewares';
import rootReducer from './reducers';

import { saveEpic, saveAsEpic } from './epics/saving';
import { newKernelEpic } from './epics/kernelLaunch';

const epics = combineEpics(saveEpic, saveAsEpic, newKernelEpic);

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
