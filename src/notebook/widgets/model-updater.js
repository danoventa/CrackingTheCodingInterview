import Rx from 'rxjs/Rx';
import difference from 'lodash.difference';

/**
 * Updates widget models based on the redux store state.
 */
export class ModelUpdater {

  /**
   * Public constructor.
   * @param  {Redux.store} store
   * @param  {widgets.WidgetManager} manager
   * @return {ModelUpdater}
   */
  constructor(store, manager) {
    // Listen for changes to the redux store widgets
    Rx.Observable.from(store)
      .pluck('document')
      .pluck('widgetModels')
      .distinctUntilChanged((a, b) => !a || a.equals(b))
      .subscribe(this.reduxStateChange.bind(this, manager));
  }

  /**
   * Update the widget models based on the state store change
   * @param  {widgets.WidgetManager} manager
   * @param  {object} newState - state of the widgets key
   */
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
