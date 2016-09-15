import { expect } from 'chai';
import Immutable from 'immutable';
import Github from 'github';
import {
  emptyNotebook,
  emptyCodeCell,
  appendCell,
} from 'commutable';

import { shutdownKernel } from '../src/notebook/kernel/shutdown';
import * as actions from '../src/notebook/actions';
import createStore from '../src/notebook/store';
import { reducers } from '../src/notebook/reducers';
import { acquireKernelInfo } from '../src/notebook/epics/kernel-launch';

import { AppRecord, DocumentRecord, MetadataRecord } from '../src/notebook/records';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../src/notebook/kernel/messaging';

const sinon = require('sinon');

export function dummyStore(config) {
  const notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], 'python2');
  return createStore({
    document: DocumentRecord({
      notebook,
      cellPagers: new Immutable.Map(),
      stickyCells: new Immutable.Map(),
      outputStatuses: new Immutable.Map(),
    }),
    app: AppRecord({
      executionState: 'not connected',
      notificationSystem: {
        addNotification: sinon.spy(),
      }
    }),
    metadata: MetadataRecord({
      filename: (config && config.noFilename) ? null : 'dummy-store-nb.ipynb',
      past: new Immutable.List(),
      future: new Immutable.List(),
    }),
  }, reducers);
}
