import React from 'react';

import { expect } from 'chai';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import {
  dummyCommutable,
} from '../dummy-nb';

import Notebook from '../../../src/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = renderIntoDocument(
      <Notebook notebook={dummyCommutable} />
    );
    expect(component).to.not.be.null;
  });
});
