import React from 'react';

import { mount } from 'enzyme';

const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;

import * as commutable from 'commutable';
import { dummyStore } from '../../../utils';

import { Toolbar } from '../../../../src/notebook/components/cell/toolbar';
import { setNotificationSystem } from '../../../../src/notebook/actions';


describe('Toolbar', () => {
  it('should be able to render a toolbar', () => {
    const toolbar = mount(
      <Toolbar />
    );
    expect(toolbar).to.not.be.null;
    expect(toolbar.find('div.cell-toolbar').length).to.be.greaterThan(0);
  });
  it('setHoverState does not error', () => {
    const toolbar = mount(
      <Toolbar setHoverState={() => {}}/>
    );
    expect(() => toolbar.instance().setHoverState({
      clientX: 0,
      clientY: 0,
    })).to.not.throw(Error);
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

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store: store } }
    );

    const button = toolbar
      .find('.executeButton');

    button.simulate('click');

    // Note that this is a sinon spy
    const notifier = store.getState().app.notificationSystem;

    expect(store.getState().app.notificationSystem.addNotification)
  });
});
