import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import Notebook from './components/Notebook';

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../test-notebooks/Functional.ipynb');
const immutableNotebook = Immutable.fromJS(notebook);

ReactDOM.render(
  <Notebook cells={immutableNotebook.get('cells')}
            language={immutableNotebook.getIn(['metadata', 'language_info', 'name'])} />
, document.querySelector('#app'));
