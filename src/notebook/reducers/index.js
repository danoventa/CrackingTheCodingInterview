import { combineReducers } from 'redux';
import undoable from 'redux-undo';

import app from './app';
import document from './document';
import metadata from './metadata';

export default combineReducers({
  app,
  metadata,
  document: undoable(document),
});
