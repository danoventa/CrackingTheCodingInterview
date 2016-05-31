import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import configureStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
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
    app: {
      executionState: 'not connected',
      github,
    },
    document: {
      notebook: null,
      filename: launchData.filename,
      cellPagers: new Immutable.Map(),
      cellStatuses: new Immutable.Map(),
      stickyCells: new Immutable.Map(),
    },
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

  initNativeHandlers(store);
  initMenuHandlers(store, dispatch);
  initGlobalHandlers(store, dispatch);

  class App extends React.Component {
    constructor(props) {
      super(props);
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
      Rx.Observable.from(store).subscribe(state => this.setState(state));
      dispatch(setNotificationSystem(this.refs.notificationSystem));
      const state = store.getState();
      const filename = (state && state.app.filename) || launchData.filename;
      dispatch(setNotebook(launchData.notebook, filename));
    }
    render() {
      return (
        <Provider
          rx={{ dispatch, store }}
          notificationSystem={this.state.app && this.state.app.notificationSystem}
          executionState={this.state.app && this.state.app.executionState}
          channels={this.state.app && this.state.app.channels}
        >
          <div>
            {
              this.state.err &&
                <pre>{this.state.err.toString()}</pre>
            }
            {
              this.state.document && this.state.document.notebook &&
                <Notebook
                  theme={this.state.document.theme}
                  notebook={this.state.document.notebook}
                  channels={this.state.app.channels}
                  cellPagers={this.state.document.cellPagers}
                  focusedCell={this.state.document.focusedCell}
                  cellStatuses={this.state.document.cellStatuses}
                  stickyCells={this.state.document.stickyCells}
                />
            }
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
