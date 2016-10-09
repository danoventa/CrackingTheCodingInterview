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

  it('should not expand json tree by default', () => {
    const data = { name: 'Octocat' };
    const component = shallow(
      <JsonDisplay data={data} theme='light' />
    );
    const instance = component.instance();
    expect(instance.shouldExpandNode()).to.be.false;
  });

  it('should expand json tree if expanded metadata is true', () => {
    const data = { name: 'Octocat' };
    const metadata = { expanded: true };
    const component = shallow(
      <JsonDisplay data={data} theme='light' metadata={metadata} />
    );
    const instance = component.instance();
    expect(instance.shouldExpandNode()).to.be.true;
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
