import React from 'react';

import { mount } from 'enzyme';
import {expect} from 'chai';
import { dummyStore } from '../../../utils'

import Cell from '../../../../src/notebook/components/cell/cell';
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
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}/>
    );
    expect(cell).to.not.be.null;
    expect(cell.find('div.code.cell').length).to.be.greaterThan(0);
  });
  it('setCellHoverState does not error', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}/>
    );
    expect(() => cell.instance().setCellHoverState({
      clientX: 0,
      clientY: 0,
    })).to.not.throw(Error);
  });
  it('handleKeyDown sets ctrlDown properly', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}/>
    );

    expect(cell.state('ctrlDown')).to.be.false;
    cell.simulate('keydown', { key: 'Ctrl', ctrlKey: true });
    expect(cell.state('ctrlDown')).to.be.true;
  });
  it('handleKeyUp responds properly to Ctrl + C', () => {
    const cell = mount(
      <Cell cell={commutable.emptyCodeCell} {...sharedProps}/>,
      { context: { store: dummyStore() } }
    );

    cell.simulate('keydown', { key: 'Ctrl', ctrlKey: true});
    cell.simulate('keyup', { keyCode: 67 });
    expect(cell.state('ctrlDown')).to.be.false;
  });
});
