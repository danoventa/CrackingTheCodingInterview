import React from 'react';

import { mount } from 'enzyme';
import {expect} from 'chai';

import Toolbar from '../../../../src/notebook/components/cell/toolbar';

describe('Toolbar', () => {
  it('should be able to render a toolbar', () => {
    const toolbar = mount(
      <Toolbar />
    );
    expect(toolbar).to.not.be.null;
    expect(toolbar.find('div.cell-toolbar').length).to.be.greaterThan(0);
  });
  it('setHoverState does not error', () => {
    const toolbar = mount(
      <Toolbar setHoverState={() => {}}/>
    );
    expect(() => toolbar.instance().setHoverState({
      clientX: 0,
      clientY: 0,
    })).to.not.throw(Error);
  });
});
