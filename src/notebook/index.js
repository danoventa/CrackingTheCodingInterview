import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import configureStore from './store';
import { reducers } from './reducers';
import { Provider } from 'react-redux';
import Notebook from './components/notebook';

import NotificationSystem from 'react-notification-system';

import {
  setNotebook,
  setNotificationSystem,
  setExecutionState,
} from './actions';

import { ipcRenderer as ipc } from 'electron';
import storage from 'electron-json-storage';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

import { AppRecord, DocumentRecord, MetadataRecord } from './records';

const Github = require('github');

const Rx = require('rxjs/Rx');

const github = new Github();

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN,
  }, (x) => console.error(x));
}

ipc.on('main:load', (e, launchData) => {
  const store = configureStore({
    app: new AppRecord({
      github,
    }),
    metadata: new MetadataRecord({
      past: new Immutable.List(),
      future: new Immutable.List(),
      filename: launchData.filename,
    }),
    document: new DocumentRecord(),
  }, reducers);

  const { dispatch } = store;

  Rx.Observable.from(store)
    .pluck('app')
    .pluck('channels')
    .distinctUntilChanged()
    .switchMap(channels => {
      if (!channels || !channels.iopub) {
        return Rx.Observable.of('not connected');
      }
      return channels
        .iopub
        .ofMessageType('status')
        .pluck('content', 'execution_state');
    })
    .subscribe(st => {
      dispatch(setExecutionState(st));
    });

  window.store = store;

  initNativeHandlers(store);
  initMenuHandlers(store, dispatch);
  initGlobalHandlers(store, dispatch);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
      this.state = {
        theme: 'light',
      };
      storage.get('theme', (error, data) => {
        if (error) throw error;
        if (Object.keys(data).length === 0) return;
        this.setState({
          theme: data.theme,
        });
      });
      ipc.on('menu:theme', (ev, theme) => {
        storage.set('theme', { theme });
        this.setState({ theme });
      });
    }
    componentDidMount() {
      dispatch(setNotificationSystem(this.refs.notificationSystem));
      const state = store.getState();
      const filename = (state && state.metadata.filename) || launchData.filename;
      dispatch(setNotebook(launchData.notebook, filename));
    }
    render() {
      return (
        <Provider store={store}>
          <div>
            {
              this.state.err &&
                <pre>{this.state.err.toString()}</pre>
            }
            <Notebook />
            <NotificationSystem ref="notificationSystem" />
            <link rel="stylesheet" href="../static/styles/main.css" />
            <link rel="stylesheet" href={`../static/styles/theme-${this.state.theme}.css`} />
          </div>
        </Provider>
      );
    }
  }

  ReactDOM.render(
    <App />,
    document.querySelector('#app')
  );
});
