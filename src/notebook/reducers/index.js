import app from './app';
import document from './document';
import metadata from './metadata';
import { combineReducers } from 'redux';

export default combineReducers({
  app,
  documentMetadata: combineReducers({
    metadata,
    document,
  }),
});
