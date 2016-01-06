import Immutable from 'immutable';

// This is only here as a stop gap until we test innards directly.

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../test-notebooks/multiples.ipynb');

// Convert the multiline strings from a raw notebook so we have a nice
// consistent structure for Immutable.JS
for(const cell of notebook.cells) {
  if(cell.outputs) {
    for(const output of cell.outputs) {
      if (output.data) {
        for (const mimetype in output.data) {
          if (Array.isArray(output.data[mimetype])) {
            output.data[mimetype] = output.data[mimetype].join('');
          }
        }
      }
    }
  }
}

export default Immutable.fromJS(notebook);
