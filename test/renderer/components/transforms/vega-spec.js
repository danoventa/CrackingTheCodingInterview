import React from 'react';
import { expect } from 'chai';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

import {
  Vega,
  VegaLite,
  VegaEmbed,
} from '../../../../src/notebook/components/transforms/vega';

const spec = Immutable.fromJS({});

describe('Vega', () => {
  it('renders VegaEmbed with embedMode vega', () => {
    const wrapper = shallow(
      <Vega data={spec} />
    );

    expect(wrapper.name()).to.equal('VegaEmbed');
    expect(wrapper.props().embedMode).to.equal('vega');
  });
});

describe('VegaLite', () => {
  it('renders VegaEmbed with embedMode vega-lite', () => {
    const wrapper = shallow(
      <VegaLite data={spec} />
    );

    expect(wrapper.name()).to.equal('VegaEmbed');
    expect(wrapper.props().embedMode).to.equal('vega-lite');
  });
});

describe('VegaEmbed', () => {
  it('embeds vega', () => {
    const wrapper = mount(
      <VegaEmbed
        data={spec}
        embedMode="vega-lite"
      />
    );

    const element = wrapper.instance();

    expect(element.shouldComponentUpdate()).to.equal(false);


  })
})
