import React from 'react';

import { mount } from 'enzyme';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;

import * as commutable from 'commutable';
import { dummyStore } from '../../../utils';

import Toolbar from '../../../../src/notebook/components/cell/toolbar';
import { setNotificationSystem } from '../../../../src/notebook/actions';


describe('Toolbar', () => {
  it('should be able to render a toolbar', () => {
    const toolbar = mount(
      <Toolbar />
    );
    expect(toolbar).to.not.be.null;
    expect(toolbar.find('div.cell-toolbar').length).to.be.greaterThan(0);
  });
  it('clearCellOutput does not throw error', () => {
    const toolbar = mount(
      <Toolbar />, { context: { store: dummyStore() }}
    );
    expect(() => {toolbar.instance().clearCellOutput()}).to.not.throw(Error);
  });
});

describe('Toolbar.executeCell', () => {
  it('dispatches an executeCell action', () => {
    const cell = commutable.emptyCodeCell.set('source', 'print("sup")')
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store: store } }
    );

    const button = toolbar
      .find('.executeButton');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'EXECUTE_CELL',
      source: 'print("sup")',
      id: '0-1-2-3',
    });
  });
});
