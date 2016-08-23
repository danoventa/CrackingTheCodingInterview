import { combineReducers } from 'redux';
import undoable, { excludeAction } from 'redux-undo';

import * as constants from '../constants';
import app from './app';
import document from './document';
import metadata from './metadata';

export default combineReducers({
  app,
  metadata,
  document: undoable(document, {
    filter: excludeAction([
      constants.ASSOCIATE_CELL_TO_MSG,
      constants.UPDATE_CELL_EXECUTION_COUNT,
      constants.SET_LANGUAGE_INFO,
      constants.SET_NOTEBOOK,
    ]),
  }),
});
