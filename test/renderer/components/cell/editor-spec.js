import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';
import { dummyStore } from '../../../utils'

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import Editor from '../../../../src/notebook/components/cell/editor';

describe('Editor', () => {
  it('should be able to render a markdown cell', () => {
    const store = dummyStore();
    const editorWrapper = mount(
      <Editor />,
      {
        context: { store }
      }
    );
    expect(editorWrapper).to.not.be.null;
  });
});
