import React from 'react';

import { expect } from 'chai';

import * as commutable from 'commutable';

import { getJSON } from '../../src/api';

import { join } from 'path';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import Notebook from '../../src/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    return getJSON(join(__dirname, '..', '..', 'intro.ipynb')).then(nb => {
      return commutable.fromJS(nb);
    }).then(immutableNotebook => {
      const component = renderIntoDocument(
        <Notebook notebook={immutableNotebook} />
      );

      expect(component).to.not.be.null;
    });
  });
});
