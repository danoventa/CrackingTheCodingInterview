import React from 'react';

import { expect } from 'chai';

import immutableNotebook from '../dummyNotebook';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import Notebook from '../../src/components/Notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {

    const component = renderIntoDocument(
      <Notebook cells={immutableNotebook.get('cells')}
                language={immutableNotebook.getIn(['metadata', 'language_info', 'name'])} />
    );

    expect(component).to.not.be.null;
    // TODO: Significant test
  });
});
