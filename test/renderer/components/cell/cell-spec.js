import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import {expect} from 'chai';
import { dummyStore } from '../../../utils'
import sinon from 'sinon';

import { Cell } from '../../../../src/notebook/components/cell/cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from 'transformime-react';

const sharedProps = { displayOrder, transforms };
describe('Cell', () => {
  it('should be able to render a markdown cell', () => {
    const cell = mount(
      <Cell cell={commutable.emptyMarkdownCell} {...sharedProps}/>
    );
    expect(cell).to.not.be.null;
    expect(cell.find('div.cell.text').length).to.be.greaterThan(0);
  });
  it('should be able to render a code cell', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>
    );
    expect(cell).to.not.be.null;
    expect(cell.find('div.code.cell').length).to.be.greaterThan(0);
  });
  it('setCellHoverState does not error', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>
    );

    expect(() => cell.instance().setCellHoverState({
      clientX: 0,
      clientY: 0,
    })).to.not.throw(Error);
  });
  it('handleKeyDown sets ctrlDown properly', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>
    );

    expect(cell.state('ctrlDown')).to.be.false;
    cell.simulate('keydown', { key: 'Ctrl', ctrlKey: true });
    expect(cell.state('ctrlDown')).to.be.true;
  });
  it('handleKeyUp responds properly to Ctrl + C', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>,
      { context: { store: dummyStore() } }
    );

    const spy = sinon.spy(cell.instance(), "copyCell"); 

    cell.simulate('keydown', { key: 'Ctrl', ctrlKey: true});
    cell.simulate('keyup', { keyCode: 67 });
    expect(cell.state('ctrlDown')).to.be.false;
    expect(spy.called).to.be.true;
  });
  it('handleKeyUp responds properly to Ctrl + V', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}
      cellStatus={Immutable.Map({'outputHidden': false, 'inputHidden': false})}/>,
      { context: { store: dummyStore() } }
    );

    const spy = sinon.spy(cell.instance(), "pasteCell"); 

    cell.simulate('keydown', { key: 'Ctrl', ctrlKey: true});
    cell.simulate('keyup', { keyCode: 86 });
    expect(cell.state('ctrlDown')).to.be.false;
    expect(spy.called).to.be.true;
  });
});
