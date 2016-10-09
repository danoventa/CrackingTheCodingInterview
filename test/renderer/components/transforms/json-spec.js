import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import JsonDisplay from '../../../../src/notebook/components/transforms/json';
import JSONTree from 'react-json-tree';

describe('JsonDisplay', () => {
  it('renders a <JSONTree /> component', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} theme='light' />
    );
    expect(component.find(JSONTree)).to.have.length(1);
  });

  it('shouldComponentUpdate returns false if theme doesn\'t change', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} theme='light' />
    );
    const instance = component.instance();
    expect(instance.shouldComponentUpdate({ theme: 'light' })).to.be.false;
  });

  it('shouldComponentUpdate returns true if theme changes', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} theme='light'/>
    );
    const instance = component.instance();
    expect(instance.shouldComponentUpdate({ theme: 'dark' })).to.be.true;
  });
});
