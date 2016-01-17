import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { readJSON } from './actions';

import Notebook from './components/Notebook';

const store = createStore({ notebook: null });

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    store.subscribe(state => this.setState(state));
    readJSON('./intro.ipynb');
  }
  render() {
    return (
      <div>
        {
          this.state.err &&
          <pre>{this.state.err.toString()}</pre>
        }
        {
          this.state.notebook &&
          <Notebook
            notebook={this.state.notebook} />
        }
      </div>
    );
  }
}

App.displayName = 'App';

ReactDOM.render(
  <App/>,
  document.querySelector('#app')
);
