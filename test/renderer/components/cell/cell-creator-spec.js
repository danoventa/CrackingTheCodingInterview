import React from 'react';

import { expect } from 'chai';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

import CellCreator from '../../../../src/notebook/components/cell/cell-creator';
import CellCreatorButtons from '../../../../src/notebook/components/cell/cell-creator-buttons';

describe('CellCreator', () => {
  it('can be constructed', () => {
    const component = shallow(
      <CellCreator above={false} id='test' />
    );
    expect(component).to.not.be.null;
  });
  it('creates cell creator buttons if no cells exist', () => {
    const component = shallow(
      <CellCreator above={false} id={null} />
    );
    expect(component.contains(<CellCreatorButtons above={false} id={null}/>)).to.be.true;
  });
  it('does not create cell creator buttons if not hovered', () => {
    const component = shallow(
      <CellCreator above={false} id={'test'} />
    );
    expect(component.contains(<CellCreatorButtons above={false} id={null}/>)).to.be.false;
  });
});
