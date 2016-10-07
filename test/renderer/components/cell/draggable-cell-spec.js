import React from 'react';

import { shallow } from 'enzyme';
import { expect } from 'chai';

import DraggableCell from '../../../../src/notebook/components/cell/draggable-cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from '../../../../src/notebook/components/transforms';

// Spoof DND manager for tests.
const dragDropManager = {
  getMonitor: () => { return {
    subscribeToStateChange: () => {},
    isDraggingSource: () => {},
  }; },
  getBackend: () => {},
  getRegistry: () => { return {
    addSource: () => {},
    removeSource: () => {},
  }; },
};

const sharedProps = { displayOrder, transforms };
describe('DraggableCell', () => {
  it('can be rendered', () => {
    const cell = shallow(
      <DraggableCell cell={commutable.emptyMarkdownCell} {...sharedProps}/>
    , {
      context: { dragDropManager }
    });
    expect(cell).to.not.be.null;
  });
});
