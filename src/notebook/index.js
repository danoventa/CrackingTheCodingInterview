// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

import { Provider } from 'react-redux';

import { Map as ImmutableMap } from 'immutable';

import NotificationSystem from 'react-notification-system';

import configureStore from './store';
import { reducers } from './reducers';
import Notebook from './components/notebook';

import {
  setNotificationSystem,
} from './actions';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

import {
  AppRecord,
  DocumentRecord,
  MetadataRecord,
  CommsRecord,
} from './records';

const store = configureStore({
  app: new AppRecord(),
  metadata: new MetadataRecord(),
  document: new DocumentRecord(),
  comms: new CommsRecord(),
  config: new ImmutableMap({
    theme: 'light',
  }),
}, reducers);

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

class App extends React.Component {
  props: Object
  state: Object
  notificationSystem: NotificationSystem;
  // shouldComponentUpdate: (p: Object, s: Object) => boolean

  constructor(props): void {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }
  componentDidMount(): void {
    store.dispatch(setNotificationSystem(this.notificationSystem));
  }
  render(): ?React.Element<any> { // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <div>
          <Notebook />
          <NotificationSystem
            ref={(notificationSystem) => { this.notificationSystem = notificationSystem; }}
          />
          <link rel="stylesheet" href="../static/styles/main.css" />
        </div>
      </Provider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
