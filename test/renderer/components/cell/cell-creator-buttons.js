import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import Immutable from 'immutable';

import { NEW_CELL_AFTER } from '../../../../src/notebook/constants';
import CellCreatorButtons from '../../../../src/notebook/components/cell/cell-creator-buttons';

// Boilerplate test to make sure the testing setup is configured
describe('CellCreatorButtons', () => {
  it('can be constructed', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' />
    );
    expect(component).to.not.be.null;
  });
  it('has create text cell button', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' context={context} />
    );
    expect(component.find('button.add-text-cell').length).to.be.greaterThan(0);
  });
  it('has create code cell button', () => {
    const component = shallow(
      <CellCreatorButtons above={false} id='test' context={context} />
    );
    expect(component.find('button.add-code-cell').length).to.be.greaterThan(0);
  });
  it('can create text cell', () => {
    return new Promise(resolve => {
      const context = {
        dispatch: action => {
          expect(action.id).to.equal('test');
          expect(action.cellType).to.equal('markdown');
          expect(action.type).to.equal(NEW_CELL_AFTER);
          resolve();
        }
      };
      const component = shallow(
        <CellCreatorButtons above={false} id='test' />
      , { context });
      component.find('button.add-text-cell').simulate('click');
    });
  });
  it('can create code cell', () => {
    return new Promise(resolve => {
      const context = {
        dispatch: action => {
          expect(action.id).to.equal('test');
          expect(action.cellType).to.equal('code');
          expect(action.type).to.equal(NEW_CELL_AFTER);
          resolve();
        }
      };
      const component = shallow(
        <CellCreatorButtons above={false} id='test' />
      , { context });
      component.find('button.add-code-cell').simulate('click');
    });
  });
});
