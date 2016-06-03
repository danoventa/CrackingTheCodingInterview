import Rx from 'rxjs/Rx';
import { ManagerBase } from 'jupyter-js-widgets';
import { BackendSync } from './backend-sync';
import { ModelUpdater } from './model-updater';
import { createMessage } from '../api/messaging';

class PhonyComm {
  constructor(store, id) {
    this.id = id;
    this.store = store;
  }

  send(data, callbacks, metadata, buffers) {
    // Only allow custom messages to be sent to the backend.  This prevents
    // the widget machinery from sending state updates directly to the backend.
    // Instead, the redux widget state management system should send the
    // updates.  See backend-sync.js for the state logic.
    if (!data || data.method !== 'custom') return;

    //  Construct comm msg
    const msg = createMessage('comm_msg');
    msg.content = {
      comm_id: this.id,
      data: data || {},
    };
    msg.metadata = metadata || msg.metadata;
    msg.buffers = buffers || msg.buffers; // TODO: Make sure this works

    // Subscribe, send msg, unsubscribe
    const shell = this.store.getState().app.channels.shell;
    const shellSubscription = shell.subscribe(() => {});
    shell.next(msg);
    shellSubscription.unsubscribe();
  }

  close() { }
}

export class WidgetManager extends ManagerBase {
  constructor(store, dispatch) {
    super();
    this.store = store;
    this.dispatch = dispatch;
    this._internalModels = {};

    // Create the mechanisms for syncing between redux state, backbone state,
    // and the backend.
    this.backendToRedux = new BackendSync(
      store,
      dispatch,
      this.createModel.bind(this),
      this.comm_target_name,
      this.version_comm_target_name
    );
    this.reduxToManager = new ModelUpdater(store, this);
  }

  createModel(id, data) {
    let modelLoaded;
    this._internalModels[id] = new Promise(resolve => (modelLoaded = resolve));

    const modelPromise = this.new_model({
      model_name: data._model_name,
      model_module: data._model_module,
      model_id: id,
    }, data).catch(err => console.error("Couldn't create a model.", err));

    // Listen for changes to the model so that they can be applied to the store
    // Create an observable from the current model state, and from the model
    // change event.  Merge them and use that observable to update the store.
    const modelInfoPromise = modelPromise.then(model => {
      model.comm = new PhonyComm(this.store, id);
      modelLoaded(model);
      const initialState = Rx.Observable
        .of(this.getSerializedModelState(model));
      const stateChangeEvents = Rx.Observable
        .fromEvent(model, 'change')
        .map(() => this.getSerializedModelState(model));
      const stateChanges = initialState.merge(stateChangeEvents);
      return { model, stateChanges };
    });

    return modelInfoPromise;
  }

  createViewForModel(id, cellId) {
    return this._models[id].then(model => this.create_view(model, { cellId }));
  }

  getSerializedModelState(model) {
    const state = model.constructor._serialize_state(model.get_state(false), this);
    // TODO HACK
    // Here I'm lazy so I convert from JS to JSON and back to traverse the
    // object hierarcy serializing where needed.
    return state.then(js => JSON.parse(JSON.stringify(js)));
  }

  setModelState(id, serializedState) {
    return this._internalModels[id].then(model => {
      const statePromise = model.constructor._deserialize_state(serializedState, this);
      return statePromise.then(state => model.set_state(state));
    });
  }

  deleteModels(ids) {
    // To delete widgets make their "comms close" which will trigger the
    // natural cleanup subroutines of the widgets.
    ids.forEach(deletedId => {
      this._models[deletedId].then(model => {
        model._handle_comm_closed();
      });
    });
  }
}
