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
});
