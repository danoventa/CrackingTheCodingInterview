import Rx from 'rxjs/Rx';
import {
  setWidgetState,
  deleteWidget,
  displayWidget,
  associateCellToMsg,
} from '../actions';

import {
  commMessages,
  commOpenMessages,
  commCloseMessages,
  openComm,
  commIdFilter,
  sendCommMessage,
  getCommTargetName,
  getCommId,
  getMessageData,
} from './comms';

/**
 * Make a predicate for msgs by widget message "method"
 * @param  {string} method
 * @return {function} predicate (filter)
 */
function methodFilter(method) {
  return msg => getMessageData(msg).method === method;
}

/**
 * Manages communications from the backend with the redux store and widget manager.
 */
export class BackendSync {

  /**
   * Public constructor
   * @param  {Redux.store} store
   * @param  {(modelId, msgData) => Promise<{model, stateChanges}>} createModelCb -
   *                             callback used to create widgets.
   * @param  {string} commTargetName - widget comm target name
   * @param  {string} versionCommTargetName - version validation comm target name
   * @param  {() => widgets.WidgetView} lastViewCb - gets the last active widget view
   * @return {BackendSync}
   */
  constructor(store, createModelCb, commTargetName, versionCommTargetName, lastViewCb) {
    this.validateWidgetVersion(store, versionCommTargetName);
    this.makeWidgetObservables(store, commTargetName);
    this.makeWidgets(store, createModelCb, lastViewCb);
  }

  /**
   * Valid the widget framework version
   * @param  {Redux.store} store
   * @param  {string} versionCommTargetName - version validation comm target name
   */
  validateWidgetVersion(store, versionCommTargetName) {
    // listen for widget frontend validation
    let validate = null;
    this.versionValidated = new Promise(resolve => validate = resolve); // eslint-disable-line
    openComm(store, versionCommTargetName).then(info => {
      const { commId } = info;
      commMessages(store)
        .filter(commIdFilter(commId))
        .subscribe(msg => {
          sendCommMessage(store, commId, {
            // TODO: Instead of validating by default, make sure the frontend is
            // compatible with the version the backend is requesting.
            validated: true,
          }, msg.header);

          // console.info('Backend requested ipywidgets version ', getMessageData(msg));
          validate();
        });
    });
  }

  /**
   * Make widget message observables.
   * @param  {Redux.store} store
   * @param  {string} commTargetName - widget comm target name
   */
  makeWidgetObservables(store, commTargetName) {
    this.displayMessages = commMessages(store)
      .filter(methodFilter('display'));
    this.customMessages = commMessages(store)
      .filter(methodFilter('custom'));
    this.updateMessages = commMessages(store)
      .filter(methodFilter('update'));
    this.newWidgets = commOpenMessages(store)
      .filter(msg => getCommTargetName(msg) === commTargetName);
    this.deleteWidgets = commCloseMessages(store);
  }

  /**
   * Make widgets using the widget observables
   * @param  {Redux.store} store
   * @param  {(modelId, msgData) => Promise<{model, stateChanges}>} createModelCb -
   *                             callback used to create widgets.
   * @param  {() => widgets.WidgetView} lastViewCb - gets the last active widget view
   */
  makeWidgets(store, createModelCb, lastViewCb) {
    // Use a model instance to set state on widget creation because the
    // widget instantiation logic is complex and we don't want to have to
    // duplicate it.  This is the only point in the lifespan where the widget
    // model is the source of truth.  After it is created, the application
    // state that lives in the state store is the source of truth.  This allows
    // external inputs, like real time collaboration, to work.
    this.newWidgets
      .map(msg => Rx.Observable.fromPromise(
        createModelCb(getCommId(msg), getMessageData(msg)))
      )
      .mergeAll()
      .subscribe(modelInfo => {
        const { model, stateChanges } = modelInfo;
        this.makeWidget(store, lastViewCb, model, stateChanges);
      });
  }

  /**
   * Make a widget
   * @param  {Redux.store} store
   * @param  {() => widgets.WidgetView} lastViewCb - gets the last active widget view
   * @param  {widgets.WidgetModel} model - instance created by WidgetManager
   * @param  {Observable} stateChanges - observable for the model instance state
   */
  makeWidget(store, lastViewCb, model, stateChanges) {
    const thisWidget = commIdFilter(model.id);

    // Handle state updates.
    // State updates are applied to the store, not the widget directly.
    // It's not the responsibility of this code to update the widget model.
    // Merge incomming state update events with state changes from the
    // widget model itself to create an all inclusive observable that can be
    // used to update the store.
    const commStateUpdates = this.updateMessages
      .filter(thisWidget)
      .map(msg => Promise.resolve(getMessageData(msg).state));
    const backendStateSubscription = stateChanges.merge(commStateUpdates)
      .map(x => Rx.Observable.fromPromise(x))
      .concatAll()
      .subscribe(stateChange => {
        store.dispatch(setWidgetState(
          model.id,
          stateChange
        ));
      });

    // Communicate state changes of the backbone models to the backend.
    const frontendStateSubscription = stateChanges
      .map(x => Rx.Observable.fromPromise(x))
      .concatAll()
      .subscribe(stateChange => {
        // Send state change message to the backend
        sendCommMessage(store, model.id, {
          method: 'backbone',
          sync_data: stateChange,
          buffer_keys: [],
        }).then(msgId => {
          // Associate this state update with the last known view to have
          // triggered state change.
          const lastView = lastViewCb();
          if (lastView && lastView.options && lastView.options.cellId) {
            store.dispatch(associateCellToMsg(lastView.options.cellId, msgId));
          }
        });
      });

    // Display messages
    const displaySubscription = this.displayMessages
      .filter(thisWidget)
      .subscribe(msg => store.dispatch(displayWidget(model.id, msg.parent_header.msg_id)));

    // Custom messages, pass them directly into the widget model
    const customMsgSubscription = this.customMessages
      .filter(thisWidget)
      .subscribe(msg => model._handle_comm_msg(msg));

    // Comm close messages, clean-up time!
    const deleteSubscription = this.deleteWidgets
      .filter(thisWidget)
      .subscribe(() => {
        backendStateSubscription.unsubscribe();
        frontendStateSubscription.unsubscribe();
        displaySubscription.unsubscribe();
        customMsgSubscription.unsubscribe();
        deleteSubscription.unsubscribe();
        deleteWidget(model.id);
      });
  }
}
