import Rx from 'rxjs/Rx';
import difference from 'lodash.difference';

export class ModelUpdater {
  constructor(store, manager) {
    Rx.Observable.from(store)
      .pluck('document')
      .pluck('widgetModels')
      .distinctUntilChanged((a, b) => !a || a.equals(b))
      .subscribe(this.reduxStateChange.bind(this, manager));
  }

  reduxStateChange(manager, newState) {
    if (!newState) return;

    // Delete widgets that no longer exist in the state.
    manager.deleteModels(
      difference(Object.keys(manager.modelPromises), newState.keySeq().toJS())
    );

    // Set new states
    newState.entrySeq().forEach(modelState => {
      const [model, state] = modelState;
      manager.setModelState(model, state.toJS());
    });
  }
}
