import Rx from 'rxjs/Rx';
import { ManagerBase } from 'jupyter-js-widgets';
import { BackendToRedux } from './backend-to-redux';
import { ReduxToManager } from './redux-to-manager';
import { setWidgetState } from '../actions';

export class WidgetManager extends ManagerBase {
  constructor(store, dispatch) {
    super();
    this.dispatch = dispatch;

    // Create the mechanisms for syncing between redux state, backbone state,
    // and the backend.
    this.backendToRedux = new BackendToRedux(
      store,
      dispatch,
      this.createModel.bind(this));
    this.reduxToManager = new ReduxToManager(store, this);
  }

  createModel(id, data) {
    const modelPromise = this.new_model({
      model_name: data._model_name,
      model_module: data._model_module,
      model_id: id,
    }, data).catch(err => console.error("Couldn't create a model.", err));

    // Listen for changes to the model so that they can be applied to the store
    // Create an observable from the current model state, and from the model
    // change event.  Merge them and use that observable to update the store.
    const modelInfoPromise = modelPromise.then(model => {
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
    return model.constructor._serialize_state(model.get_state(false), this);
  }

  setModelState(id, serializedState) {
    return this._models[id].then(model =>
      model.constructor._deserialize_state(serializedState, this).then(state => {
        model.set_state(state);
      })
    );
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
