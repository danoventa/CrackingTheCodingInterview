import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import Immutable from 'immutable';

import { dummyStore } from '../../../utils';

import { NEW_CELL_AFTER, NEW_CELL_BEFORE } from '../../../../src/notebook/constants';
import { CellCreatorButtons } from '../../../../src/notebook/components/cell/cell-creator-buttons';

describe('CellCreatorButtons', () => {
  it('can be constructed', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' />
    );
    expect(component).to.not.be.null;
  });
  it('has create text cell button', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' />
    );
    expect(component.find('button.add-text-cell').length).to.be.greaterThan(0);
  });
  it('has create code cell button', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' />
    );
    expect(component.find('button.add-code-cell').length).to.be.greaterThan(0);
  });
  it('can create text cell', () => {
    const store = dummyStore();
    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal('test');
        expect(action.cellType).to.equal('markdown');
        expect(action.type).to.equal(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const component = shallow(
        <CellCreatorButtons above={false} id='test' />
      , { context: { store } });
      component.find('button.add-text-cell').simulate('click');
    });
  });
  it('can create code cell', () => {
    const store = dummyStore();
    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal('test');
        expect(action.cellType).to.equal('code');
        expect(action.type).to.equal(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const component = shallow(
        <CellCreatorButtons above={false} id='test' />
      , { context: { store } });
      component.find('button.add-code-cell').simulate('click');
    });
  });
  it('can add a cell above the current one', () => {
    const store = dummyStore();
    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal('test');
        expect(action.cellType).to.equal('code');
        expect(action.type).to.equal(NEW_CELL_BEFORE);
        resolve();
      };
      store.dispatch = dispatch;
      const component = shallow(
        <CellCreatorButtons above={true} id='test' />
      , { context: { store } });
      component.find('button.add-code-cell').simulate('click');
    });
  });
  it('creates a new cell if cell has no id', () => {
    const store = dummyStore();
    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.cellType).to.equal('code');
        expect(action.type).to.equal('NEW_CELL_APPEND');
        resolve();
      };
      store.dispatch = dispatch;
      const component = shallow(
        <CellCreatorButtons above={false} />
      , { context: { store } });
      component.find('button.add-code-cell').simulate('click');
    });
  });
});
