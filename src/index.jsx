import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import Notebook from './components/Notebook';

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../test-notebooks/ConfinedOutput.ipynb');

// Convert the multiline strings from a raw notebook so we have a nice
// consistent structure for Immutable.JS
for(let cell of notebook.cells) {
  if(cell.outputs) {
    for(let output of cell.outputs) {
      if (output.data) {
        for (let mimetype in output.data) {
          if (Array.isArray(output.data[mimetype])) {
              output.data[mimetype] = output.data[mimetype].join('');
          }
        }
      }
    }
  }
}


const immutableNotebook = Immutable.fromJS(notebook);


ReactDOM.render(
  <Notebook cells={immutableNotebook.get('cells')}
            language={immutableNotebook.getIn(['metadata', 'language_info', 'name'])} />
, document.querySelector('#app'));
