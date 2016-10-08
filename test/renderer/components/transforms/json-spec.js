import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import JsonDisplay from '../../../../src/notebook/components/transforms/json';
import JSONTree from 'react-json-tree';

describe('JsonDisplay', () => {
  it('renders a <JSONTree /> component', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} />
    );
    expect(component.find(JSONTree)).to.have.length(1);
  });

  it('shouldComponentUpdate returns true', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} />
    );
    const instance = component.instance();
    expect(instance.shouldComponentUpdate()).to.be.true;
  })
});
