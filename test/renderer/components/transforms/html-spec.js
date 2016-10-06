import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import HTMLDisplay from '../../../../src/notebook/components/transforms/html';

describe('HTMLDisplay', () => {
  it.skip('renders direct HTML', () => {
    const component = mount(
      <HTMLDisplay data={'<b>woo</b>'} />
    );

    expect(component.html()).to.equal('<div><b>woo</b></div>');
  });
  it.skip('executes embedded <script> tags', (done) => {
    const originalCreateRange = global.document.createRange;
    global.document.createRange = () => {
      done(); // fake spy
      return originalCreateRange();
    }

    const component = mount(
      <HTMLDisplay data={'<script>window.x = 2</script>'} />
    );

  });
});
