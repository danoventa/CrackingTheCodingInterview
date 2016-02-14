import { fromJS } from 'commutable';

import { getJSON } from '../src/api';

const nbPromise = getJSON('../intro.ipynb').then(nb => {
  return fromJS(nb);
});

export default nbPromise;
