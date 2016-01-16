import { fromJS } from 'commutable';

// This is only here as a stop gap until we test innards directly.

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../intro.ipynb');

export default fromJS(notebook);
