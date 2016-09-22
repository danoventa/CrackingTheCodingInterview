import { List } from 'immutable';

import { createEpicMiddleware, combineEpics } from 'redux-observable';

import epics from './epics';
import * as constants from './constants';

const rootEpic = combineEpics(...epics);

const middlewares = [
  createEpicMiddleware(rootEpic),
];

export default middlewares;
