import Immutable from 'immutable';

const Github = require('github');

export const AppRecord = new Immutable.Record({
  executionState: 'not connected',
  github: new Github(), // default to no auth until setup
  channels: null,
  spawn: null,
  connectionFile: null,
  notificationSystem: null,
  kernelSpecName: null,
  isSaving: false,
  modified: false,
  theme: 'light',
});

export const DocumentRecord = new Immutable.Record({
  notebook: null,
  cellPagers: new Immutable.Map(),
  cellStatuses: new Immutable.Map(),
  outputStatuses: new Immutable.Map(),
  stickyCells: new Immutable.Map(),
  focusedCell: null,
  cellMsgAssociations: new Immutable.Map(),
  msgCellAssociations: new Immutable.Map(),
  copied: new Immutable.Map(),
});

export const MetadataRecord = new Immutable.Record({
  past: new Immutable.List(),
  future: new Immutable.List(),
  filename: '',
});
