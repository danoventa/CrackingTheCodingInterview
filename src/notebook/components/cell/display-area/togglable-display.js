import React from 'react';
import Immutable from 'immutable';

import { transforms, displayOrder } from 'transformime-react';

import Display from './display';

export default function TogglableDisplay(props) {
  if (!props.isHidden) {
    return (
      <Display
        outputs={props.outputs}
        displayOrder={props.displayOrder}
        transforms={props.transforms}
      />
    );
  }
  return null;
}

TogglableDisplay.propTypes = {
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  outputs: React.PropTypes.instanceOf(Immutable.List),
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  isHidden: React.PropTypes.bool,
};

TogglableDisplay.defaultProps = {
  transforms,
  displayOrder,
};
