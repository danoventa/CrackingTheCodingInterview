import { expect } from 'chai';
import Immutable from 'immutable';
import Github from 'github';
import {
  emptyNotebook,
  emptyCodeCell,
  appendCell,
} from 'commutable';

import { shutdownKernel } from '../src/notebook/api/kernel';
import * as actions from '../src/notebook/actions';
import { getEntries } from '../src/notebook/performance';
import createStore from '../src/notebook/store';
import { reducers } from '../src/notebook/reducers';
import { acquireKernelInfo } from '../src/notebook/agendas';

export function dispatchQueuePromise(dispatch) {
  return new Promise(resolve => {
    resolve();
  });
}

function waitFor(cb) {
  return new Promise(resolve => {
    function _waitFor() {
      if (cb()) {
        resolve();
      } else {
        setTimeout(_waitFor, 100);
      }
    }
    _waitFor();
  });
}

function waitForKernel(store) {
  return waitFor(() => {
    const language_info = store.getState().document.getIn(['notebook', 'metadata', 'language_info']);
    const spawn = store.getState().app.spawn;
    const kernelState = store.getState().app.executionState;
    return spawn && language_info && kernelState === 'idle';
  });
}

export function waitForOutputs(store, cellId) {
  return waitFor(() => {
    const outputs = store.getState().document.getIn(['notebook', 'cellMap', cellId, 'outputs'], []);
    return outputs.count() > 0;
  });
}

export function liveStore(cb, kernelName='python2') {
  const github = new Github();
  const notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], kernelName);
  const store = createStore({
    document: Immutable.Map({
      notebook,
      cellPagers: new Immutable.Map(),
      cellStatuses: new Immutable.Map(),
      stickyCells: new Immutable.Map(),
      widgetViews: new Immutable.Map(),
      widgetModels: new Immutable.Map(),
      cellMsgAssociations: new Immutable.Map(),
      msgCellAssociations: new Immutable.Map(),
    }),
    app: {
      executionState: 'not connected',
      github,
    }
  }, reducers);

  store.dispatch(actions.setNotebook(notebook, ''));

  const kernel = {};
  return dispatchQueuePromise(store.dispatch)
    .then(() => waitForKernel(store))
    .then(() => {
      const state = store.getState();
      kernel.channels = state.app.channels;
      kernel.spawn = state.app.spawn;
      kernel.connectionFile = state.app.connectionFile;
      expect(kernel.channels).to.not.be.undefined;
    })
    .then(() => Promise.resolve(cb(kernel, store.dispatch, store)))
    .then(() => dispatchQueuePromise(store.dispatch))
    .then(() => shutdownKernel(kernel).then(() => {
      expect(kernel.channels).to.be.undefined;
    })
  );
}
