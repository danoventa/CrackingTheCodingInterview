import React from 'react';

import { shallow, mount } from 'enzyme';
import {expect} from 'chai';

import MarkdownCell from '../../../../src/notebook/components/cell/markdown-cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from 'transformime-react';

describe('MarkdownCell', () => {
  it('can be rendered', () => {
    const cell = shallow(
      <MarkdownCell cell={commutable.emptyMarkdownCell} {...{ displayOrder, transforms }}/>
    );
    expect(cell).to.not.be.null;
  });

  it('toggles view mode with key events', () => {
    const cell = mount(
      <MarkdownCell cell={commutable.emptyMarkdownCell} {...{ displayOrder, transforms }}/>
    );

    // Starts in view mode
    expect(cell.state('view')).to.be.true;
    cell.simulate('keydown', { key: 'Enter', shiftKey: true })
    // Stays in view mode on shift enter
    expect(cell.state('view')).to.be.true;
    // Enter key enters edit mode
    cell.simulate('keydown', { key: 'Enter'})
    expect(cell.state('view')).to.be.false;
    // Back to view mode
    cell.simulate('keydown', { key: 'Enter', shiftKey: true })
    expect(cell.state('view')).to.be.true;
  });

  it('sets the state of the text based on cell source', () => {
    const cell = mount(
      <MarkdownCell cell={commutable.emptyMarkdownCell} {...{ displayOrder, transforms }}/>
    );

    cell.setProps({'cell': commutable.emptyMarkdownCell.set('source', 'test')});
    expect(cell.state('source')).to.equal('test');
  })
});
