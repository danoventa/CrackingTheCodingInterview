// @flow
import React from 'react';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { transforms, displayOrder } from '../../transforms';

import Display from './display';

type Props = {
  displayOrder: ImmutableList<string>,
  outputs: ImmutableList<any>,
  transforms: ImmutableMap<string, any>,
  isHidden: boolean,
  theme: string,
};

export default function TogglableDisplay(props: Props) {
  if (!props.isHidden) {
    return (
      <Display
        outputs={props.outputs}
        displayOrder={props.displayOrder}
        transforms={props.transforms}
        theme={props.theme}
      />
    );
  }
  return null;
}

TogglableDisplay.defaultProps = {
  transforms,
  displayOrder,
};
