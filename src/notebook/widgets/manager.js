import { ManagerBase } from 'jupyter-js-widgets';
import { BackendToRedux } from './backend-to-redux';

export class WidgetManager extends ManagerBase {
  constructor(store, dispatch) {
    super();
    this.store = store;
    this.dispatch = dispatch;

    // Create the mechanisms for syncing between redux state, backbone state,
    // and the backend.
    this.backendToRedux = new BackendToRedux(store, dispatch);
  }

  createViewForModel(modelId, cellId) {
    // TODO: replace widget view
    return document.createElement('div');
  }
}
