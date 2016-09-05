import React from 'react';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

const TestBackend = require('react-dnd-test-backend');
import { DragDropContext } from 'react-dnd';

import Cell from '../../../src/notebook/components/cell/cell';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;

import { dummyStore } from '../../utils';

import {
  dummyCommutable,
} from '../dummy-nb';

const dummyCellStatuses = dummyCommutable.get('cellOrder')
      .reduce((statuses, cellID) =>
        statuses.set(cellID, Immutable.fromJS({ outputHidden: false, inputHidden: false })),
      new Immutable.Map());

import { Notebook, ConnectedNotebook } from '../../../src/notebook/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = shallow(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={(new Immutable.Map())
          // Sticky the first cell of the notebook so that the sticky code gets
          // triggered.
          .set(dummyCommutable.getIn(['cellOrder', 0]), true)
        }
        CellComponent={Cell}
        outputStatuses={new Immutable.Map()}
      />
    );
    expect(component).to.not.be.null;
  });
  it('implements the correct css spec', () => {
    const component = mount(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={dummyCellStatuses}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
        CellComponent={Cell}
      />
    );
    expect(component.find('.notebook').length).to.be.above(0, '.notebook');
    expect(component.find('.notebook .cell').length).to.be.above(0, '.notebook .cell');
    expect(component.find('.notebook .cell.text').length).to.be.above(0, '.notebook .cell.text');
    expect(component.find('.notebook .cell.code').length).to.be.above(0, '.notebook .cell.code');
    expect(component.find('.notebook .cell.unknown').length).to.equal(0, '.notebook .cell.unknown does not exist');
    expect(component.find('.notebook .cell.text .rendered').length).to.be.above(0, '.notebook .cell.text .rendered');
    expect(component.find('.notebook .cell.code .input-container').length).to.be.above(0, '.notebook .cell.code .input-container');
    expect(component.find('.notebook .cell.code .input-container .prompt').length).to.be.above(0, '.notebook .cell.code .input-container .prompt');
    expect(component.find('.notebook .cell.code .input-container .input').length).to.be.above(0, '.notebook .cell.code .input-container .input');
    expect(component.find('.notebook .cell.code .outputs').length).to.be.above(0, '.notebook .cell.code .outputs');
  });

  it('dispatches cut/copy/paste actions', () => {
    // Note: because the notebook component is so heavy to load, this test is
    // bulked up with all the cut, copy, paste goodness
    const focusedCell = dummyCommutable.getIn(['cellOrder', 0]);

    const context = {
      store: dummyStore(),
    }

    context.store.dispatch = sinon.spy();

    const component = shallow(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={dummyCellStatuses}
        stickyCells={(new Immutable.Map())}
        outputStatuses={new Immutable.Map()}
        CellComponent={Cell}
        focusedCell={focusedCell}
      />, { context });

    const inst = component.instance();

    inst.copyCell();
    expect(context.store.dispatch.firstCall).to.have.been.calledWith({
      type: 'COPY_CELL',
      id: focusedCell,
    })

    inst.cutCell();
    expect(context.store.dispatch.secondCall).to.have.been.calledWith({
      type: 'CUT_CELL',
      id: focusedCell,
    })

    inst.pasteCell();
    expect(context.store.dispatch.thirdCall).to.have.been.calledWith({
      type: 'PASTE_CELL'
    });
  });

  it('responds via ctrl-shift-c with a COPY_CELL action', () => {
    // Note: because the notebook component is so heavy to load, this test is
    // bulked up with all the cut, copy, paste goodness
    const focusedCell = dummyCommutable.getIn(['cellOrder', 0]);

    const context = {
      store: dummyStore(),
    }

    context.store.dispatch = sinon.spy();

    const component = shallow(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={dummyCellStatuses}
        stickyCells={(new Immutable.Map())}
        outputStatuses={new Immutable.Map()}
        CellComponent={Cell}
        focusedCell={focusedCell}
      />, { context });

    const inst = component.instance();

    // Note that we can't use enzyme's simulate because the event listener is
    // document level not React level
    const ev = new window.CustomEvent('keydown');
    ev.ctrlKey = true;
    ev.shiftKey = true;
    ev.keyCode = 'c'.charCodeAt(0) - 32; // get the key code

    inst.keyDown(ev);
    expect(context.store.dispatch).to.have.been.calledWith({
      type: 'COPY_CELL',
      id: focusedCell,
    })

    ev.keyCode = 'v'.charCodeAt(0) - 32;
    inst.keyDown(ev);
    expect(context.store.dispatch).to.have.been.calledWith({
      type: 'PASTE_CELL',
    })

    ev.keyCode = 'x'.charCodeAt(0) - 32;
    inst.keyDown(ev);
    expect(context.store.dispatch).to.have.been.calledWith({
      type: 'CUT_CELL',
      id: focusedCell,
    })
  })
})

describe('Notebook DnD', () => {
  it('drag and drop can be tested', () => {
    const TestNotebook = DragDropContext(TestBackend)(Notebook);

    const component = mount(
      <TestNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={dummyCellStatuses}
        stickyCells={(new Immutable.Map())}
        outputStatuses={new Immutable.Map()}
      />
    );

    const manager = component.get(0).getManager();
    const backend = manager.getBackend();

    // TODO: Write tests for cell drag and drop
  })
})


describe('Notebook.copyCell', () => {

})
