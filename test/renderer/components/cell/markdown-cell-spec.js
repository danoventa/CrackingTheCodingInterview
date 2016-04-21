import React from 'react';

import { shallow } from 'enzyme';
import {expect} from 'chai';

import MarkdownCell from '../../../../src/notebook/components/cell/markdown-cell';
import * as commutable from 'commutable';
import { displayOrder, transforms } from 'transformime-react';

describe('MarkdownCell', () => {
  it('can be rendered', () => {
    const cell = shallow(
      <MarkdownCell cell={commutable.emptyMarkdownCell} {...{ displayOrder, transforms }}/>
    );
    expect(cell).to.not.be.null;
  });
});
