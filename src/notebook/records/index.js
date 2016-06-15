import Immutable from 'immutable';

export const AppRecord = new Immutable.Record({
  executionState: 'not connected',
  github: null,
  channels: false,
  spawn: false,
  connectionFile: false,
  notificationSystem: null,
  kernelSpecName: null,
  filename: null,
  isSaving: false,
});

export const DocumentRecord = new Immutable.Record({
  notebook: null,
  cellPagers: new Immutable.Map(),
  cellStatuses: new Immutable.Map(),
  stickyCells: new Immutable.Map(),
  focusedCell: null,
  cellMsgAssociations: new Immutable.Map(),
  msgCellAssociations: new Immutable.Map(),
});

export const DocumentMetadataRecord = new Immutable.Record({
  past: new Immutable.List(),
  future: new Immutable.List(),
  filename: '',
  document: new DocumentRecord(),
});
