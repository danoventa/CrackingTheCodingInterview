import React from 'react';

import chai, { expect } from 'chai';
import jsxChai from 'jsx-chai';

chai.use(jsxChai);

import Immutable from 'immutable';

import {
  createRenderer
} from 'react-addons-test-utils';

import Display from '../../../../../src/notebook/components/cell/display-area';
import { displayOrder, transforms } from '../../../../../src/notebook/components/transforms';

describe('Display', () => {
  it('does not display when status is hidden', () => {
    const renderer = createRenderer();
    const outputs = Immutable.fromJS([{
      output_type: 'display_data',
      data: {
        'text/html': 'Test content',
      }
    }]);
    renderer.render(<Display
      outputs={outputs}
      isHidden={true}
      theme={"light"}
      displayOrder={displayOrder}
      transforms={transforms}
    />);
    const component = renderer.getRenderOutput();
    expect(component).to.be.null;
  });
  it('displays status when it is not hidden', () => {
    const renderer = createRenderer();
    const outputs = Immutable.fromJS([{
      output_type: 'display_data',
      data: {
        'text/html': 'Test content',
      }
    }]);
    renderer.render(<Display
      outputs={outputs}
      isHidden={false}
      theme={"light"}
      displayOrder={displayOrder}
      transforms={transforms}
    />);
    const component = renderer.getRenderOutput();
    expect(component).to.not.be.null;
  });
});
