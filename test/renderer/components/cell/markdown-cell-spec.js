import React from 'react';

import { shallow, mount } from 'enzyme';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import MarkdownCell from '../../../../src/notebook/components/cell/markdown-cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from 'transformime-react';

import { dummyStore } from '../../../utils';

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

    cell.simulate('keydown', { key: 'Enter'})
    expect(cell.state('view')).to.be.false;
    cell.simulate('keydown', { key: 'Enter', shiftKey: true })
    // Stays in view mode on shift enter
    expect(cell.state('view')).to.be.true;
    // Enter key enters edit mode
    // Back to view mode
    cell.simulate('keydown', { key: 'Enter', shiftKey: true })
    expect(cell.state('view')).to.be.true;
  });

  it('sets the state of the text based on cell source', () => {
    const cell = mount(
      <MarkdownCell cell={commutable.emptyMarkdownCell} {...{ displayOrder, transforms }}/>,
    );

    cell.setProps({'cell': commutable.emptyMarkdownCell.set('source', 'test')});
    expect(cell.state('source')).to.equal('test');
  });

  it('navigates to the previous cell with the up arrow key', () => {
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const cell = shallow(
      <MarkdownCell id='1234' cell={commutable.emptyMarkdownCell} {...{displayOrder, transforms }}/>,
      { context: { store } }
    );

    cell.simulate('keydown', { key: 'ArrowUp' });

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'FOCUS_PREVIOUS_CELL',
      id: '1234',
    });
  });

  it('navigates to the next cell with the down arrow key', () => {
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const cell = shallow(
      <MarkdownCell id='1234' cell={commutable.emptyMarkdownCell} {...{displayOrder, transforms }}/>,
      { context: { store } }
    );

    cell.simulate('keydown', { key: 'ArrowDown' });

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'FOCUS_NEXT_CELL',
      id: '1234',
    });
  });
});
