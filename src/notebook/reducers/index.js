import { combineReducers } from 'redux';

import * as constants from '../constants';
import app from './app';
import document from './document';
import metadata from './metadata';

export default combineReducers({
  app,
  metadata,
  document,
});
