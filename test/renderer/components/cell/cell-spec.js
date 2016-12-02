import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';
import { dummyStore } from '../../../utils'

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { Cell } from '../../../../src/notebook/components/cell/cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from '../../../../src/notebook/components/transforms';

const sharedProps = { displayOrder, transforms };
describe('Cell', () => {
  it('should be able to render a markdown cell', () => {
    const store = dummyStore();
    const cell = mount(
      <Cell cell={commutable.emptyMarkdownCell} {...sharedProps} />,
      {
        context: { store }
      }
    );
    expect(cell).to.not.be.null;
    expect(cell.find('div.cell.text').length).to.be.greaterThan(0);
  });
  it('should be able to render a code cell', () => {
    const store = dummyStore();
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>,
      {
        context: { store }
      }
    );
    expect(cell).to.not.be.null;
    expect(cell.find('div.code.cell').length).to.be.greaterThan(0);
  });
  it('dispatches cell actions', () => {
    const store = dummyStore();
    const cell = mount(
      <Cell cell={commutable.emptyMarkdownCell} {...sharedProps} />,
      {
        context: { store }
      }
    );

    store.dispatch = sinon.spy();
    const inst = cell.instance();

    inst.selectCell();
    expect(store.dispatch.firstCall).to.have.been.calledWith({
      type: 'FOCUS_CELL',
      id: undefined,
    });

    inst.focusAboveCell();
    expect(store.dispatch.secondCall).to.have.been.calledWith({
      type: 'FOCUS_PREVIOUS_CELL',
      id: undefined,
    });
    expect(store.dispatch.thirdCall).to.have.been.calledWith({
      type: 'FOCUS_PREVIOUS_CELL_EDITOR',
      id: undefined,
    });

    inst.focusBelowCell();
    expect(store.dispatch).to.have.been.calledWith({
      type: 'FOCUS_NEXT_CELL',
      id: undefined,
      createCellIfUndefined: true,
    });
    expect(store.dispatch.lastCall).to.have.been.calledWith({
      type: 'FOCUS_NEXT_CELL_EDITOR',
      id: undefined,
    });
  });
});
