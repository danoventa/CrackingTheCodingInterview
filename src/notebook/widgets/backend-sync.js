import Rx from 'rxjs/Rx';
import { setWidgetState, deleteWidget, displayWidget } from '../actions';
import { createMessage } from '../api/messaging';
import * as uuid from 'uuid';

export class BackendSync {
  constructor(store, dispatch, createModelCb, commTargetName, versionCommTargetName) {
    this.initCommSubscriptions(store, commTargetName, versionCommTargetName);
    this.initStateListeners(store, dispatch, createModelCb);
  }

  getChannels(store) {
    return Rx.Observable.from(store)
      .pluck('app')
      .pluck('channels')
      .distinctUntilChanged();
  }

  initCommSubscriptions(store, commTargetName, versionCommTargetName) {
    const commMsgs = this.getChannels(store)
      .switchMap(channels => {
        if (!(channels && channels.iopub)) {
          return Rx.Observable.empty();
        }
        return channels.iopub.filter(msg =>
          msg && msg.header && msg.header.msg_type &&
          msg.header.msg_type.slice(0, 5) === 'comm_'
        );
      });

    const msgs = commMsgs
      .filter(msg => msg.header.msg_type === 'comm_msg')
      .pluck('content');

    // Keep a separate queue for display msgs to avoid asynchronous problems
    // because it takes a while to initiate the widget model.  Cache display
    // calls so they are available when the widgets are constructed.
    this.displayMsgs = commMsgs
      .filter(msg => msg.header.msg_type === 'comm_msg')
      .filter(msg => msg.content.data.method === 'display')
      .map(msg => ({
        parentMsgId: msg.parent_header.msg_id,
        id: msg.content.comm_id,
      }))
      .publishReplay(1000) // Remember a max of 1k msgs
      .refCount();
    // TODO: Dispose me on app cleanup
    this.displayMsgs.subscribe(() => {});

    // new comm observable
    this.comms = {};
    this.dummySubscriptions = {};
    this.newComms = commMsgs
      .filter(msg => msg.header.msg_type === 'comm_open')
      .pluck('content')
      .filter(msg => msg.target_name === commTargetName)
      .map(msg => {
        const id = msg.comm_id;
        const data = msg.data;
        this.comms[id] = msgs
          .filter(subMsg => subMsg.comm_id === id)
          .pluck('data')
          .publishReplay(1000) // Remember a max of 1k msgs
          .refCount();
        this.dummySubscriptions = this.comms[id].subscribe(() => {});
        return { id, data };
      });

    // listen for widget frontend validation
    this.getChannels(store)
      .map(channels => {
        if (!(channels && channels.shell)) {
          return Rx.Observable.empty();
        }
        return channels.shell;
      })
      .subscribe(shell => {
        if (shell && shell.next) {
          const versionCommId = uuid.v4();
          const newVersionCommMsg = createMessage('comm_open');
          newVersionCommMsg.content = {
            comm_id: versionCommId,
            target_name: versionCommTargetName,
            data: {},
          };

          let shellSubscription = shell.subscribe(() => {});
          shell.next(newVersionCommMsg);
          shellSubscription.unsubscribe();

          commMsgs
            .filter(msg => msg.header.msg_type === 'comm_msg')
            .filter(subMsg => subMsg.content.comm_id === versionCommId)
            .subscribe(subMsg => {
              const versionCommMsg = createMessage('comm_msg');
              versionCommMsg.content = {
                comm_id: versionCommId,
                data: {
                  // TODO: Instead of validating by default, make sure the frontend is
                  // compatible with the version the backend is requesting.
                  validated: true,
                },
              };

              shellSubscription = shell.subscribe(() => {});
              shell.next(versionCommMsg);
              shellSubscription.unsubscribe();

              console.log('Backend requested ipywidgets version ', subMsg.content.data); //eslint-disable-line
            });
        }
      });

    // listen for comm closing msgs
    this.deleteComms = commMsgs
      .filter(msg => msg.header.msg_type === 'comm_close')
      .pluck('content')
      .map(id => {
        delete this.comms[id];
        this.dummySubscriptions[id].unsubscribe();
        delete this.dummySubscriptions[id];
        return id;
      });
  }

  initStateListeners(store, dispatch, createModelCb) {
    // Use a model instance to set state on widget creation because the
    // widget instantiation logic is complex and we don't want to have to
    // duplicate it.  This is the only point in the lifespan where the widget
    // model is the source of truth.  After it is created, the application
    // state that lives in the state store is the source of truth.  This allows
    // external inputs, like real time collaboration, to work.
    this.newComms
      .switchMap(info => Rx.Observable.fromPromise(createModelCb(info.id, info.data)))
      .subscribe(modelInfo => {
        const { model, stateChanges } = modelInfo;

        // State updates are applied to the store, not the widget directly.
        // It's not the responsibility of this code to update the widget model.
        // Merge incomming state update events with state changes from the
        // widget model itself to create an all inclusive observable that can be
        // used to update the store.
        const commStateUpdates = this.comms[model.id]
          .filter(content => content.method === 'update')
          .map(content => Promise.resolve(content.state));
        const subscription = stateChanges.merge(commStateUpdates)
          .map(x => Rx.Observable.fromPromise(x))
          .concatAll()
          .subscribe(stateChange => {
            dispatch(setWidgetState(
              model.id,
              stateChange
            ));
          });

        // State changes on the backbone models should be communicated to the
        // backend.
        stateChanges
          .map(x => Rx.Observable.fromPromise(x))
          .concatAll()
          .subscribe(stateChange => {
            const updateMsg = createMessage('comm_msg');
            updateMsg.content = {
              comm_id: model.id,
              data: {
                method: 'backbone',
                sync_data: stateChange,
                buffer_keys: [],
              },
            };
            updateMsg.buffers = [];

            const shell = store.getState().app.channels.shell;
            const shellSubscription = shell.subscribe(() => {});
            shell.next(updateMsg);
            shellSubscription.unsubscribe();
          });

        // Listen for display messages
        const displaySubscription = this.displayMsgs
          .filter(info => info.id === model.id)
          .subscribe(info => dispatch(displayWidget(info.id, info.parentMsgId)));

        // TODO: Handle custom msgs

        // Handle cleanup time
        const deleteSubscription = this.deleteComms
          .filter(id => id === model.id)
          .subscribe(() => {
            subscription.unsubscribe();
            displaySubscription.unsubscribe();
            deleteSubscription.unsubscribe();
            deleteWidget(model.id);
          });
      });
  }
}
