import React from 'react';

import { dummyCommutable } from '../dummy-nb';
import { mount, shallow } from 'enzyme';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import StatusBar from '../../../src/notebook/components/status-bar';

describe('StatusBar', () => {
  it('can render on a dummyNotebook', () => {
    const lastSaved = new Date();
    const kernelSpecName = 'python3';
    
    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecName={kernelSpecName}
      />
    );

    expect(component).to.not.be.null;
  });
  it('no update if an irrelevant prop has changed', () => {
    const lastSaved = new Date();
    const kernelSpecName = 'python3';
    const shouldComponentUpdate = sinon.spy(StatusBar.prototype, 'shouldComponentUpdate');
    
    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecName={kernelSpecName}
      />
    );

    component.setProps({lastSaved: lastSaved, kernelSpecName: 'javascript', notebook: dummyCommutable});
    expect(shouldComponentUpdate).to.have.been.called;
    expect(shouldComponentUpdate).to.have.returned(false);
    shouldComponentUpdate.restore();
  });
  it('update if an irrelevant prop has changed', () => {
    const lastSaved = new Date();
    const kernelSpecName = 'python3';
    const shouldComponentUpdate = sinon.spy(StatusBar.prototype, 'shouldComponentUpdate');
    
    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecName={kernelSpecName}
      />
    );

    component.setProps({lastSaved: new Date(), kernelSpecName: 'python3', notebook: dummyCommutable});
    expect(shouldComponentUpdate).to.have.been.called;
    expect(shouldComponentUpdate).to.have.returned(true);
    shouldComponentUpdate.restore();
  });
});
