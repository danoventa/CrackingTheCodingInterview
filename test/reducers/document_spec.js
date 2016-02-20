import { expect } from 'chai';

import {
  loadNotebook,
} from '../../src/reducers/document';

import {
  dummyJSON,
} from '../dummy-nb';

describe('loadNotebook', () => {
  it('converts a JSON notebook to our commutable notebook and puts in state', () => {
    const state = loadNotebook({}, { data: dummyJSON });
    expect(state.notebook.get('nbformat')).to.equal(4);
  });
});
