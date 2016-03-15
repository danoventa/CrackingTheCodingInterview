import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
import Notebook from './components/notebook';

import {
  setNotebook,
} from './actions';
import { initKeymap } from './keys/keymap';
import { ipcRenderer as ipc } from 'electron';

import { initMenuHandlers } from './menu';

ipc.on('main:load', (e, launchData) => {
  const { store, dispatch } = createStore({
    notebook: null,
    filename: launchData.filename,
  }, reducers);

  initKeymap(window, dispatch);
  initMenuHandlers(store, dispatch);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      store.subscribe(state => this.setState(state));
    }
    componentDidMount() {
      dispatch(setNotebook(launchData.notebook));
    }
    render() {
      return (
        <Provider rx={{ dispatch, store }}>
          <div>
            {
              this.state.err &&
              <pre>{this.state.err.toString()}</pre>
            }
            {
              this.state.notebook &&
              <Notebook
                notebook={this.state.notebook}
                channels={this.state.channels}
              />
            }
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
