import React from 'react';
import Immutable from 'immutable';

import { shallow } from 'enzyme';
import chai, { expect } from 'chai';
import { dummyStore } from '../../../utils'

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import Pager from '../../../../src/notebook/components/cell/pager';
import * as commutable from 'commutable';
import { displayOrder, transforms } from 'transformime-react';

describe('Pager', () => {
  it('renders a mimebundle', () => {
    const pager = shallow(
      <Pager
        displayOrder={displayOrder}
        transforms={transforms}
        data={Immutable.fromJS({"text/plain": "THE DATA"})}
      />
    );

    expect(pager.instance().shouldComponentUpdate()).to.be.false;
    expect(pager.first().props()).to.deep.equal({data: 'THE DATA'});
  })
  it('does not render unknown mimetypes', () => {
    const pager = shallow(
      <Pager
        displayOrder={displayOrder}
        transforms={transforms}
        data={Immutable.fromJS({"application/ipynb+json": "{}"})}
      />
    );

    expect(pager.type()).to.be.null;
  })
})
