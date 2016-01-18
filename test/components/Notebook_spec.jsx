import React from 'react';

import { expect } from 'chai';

import immutableNotebook from '../dummyNotebook_helper';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import Notebook from '../../src/components/Notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {

    const component = renderIntoDocument(
      <Notebook notebook={immutableNotebook} />
    );

    expect(component).to.not.be.null;
  });
});
