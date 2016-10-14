// @flow
import React from 'react';

import Immutable, { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { transforms, displayOrder } from '../../transforms';

import Output from './output';

type Props = {
  displayOrder: ImmutableList<string>,
  outputs: ImmutableList<any>,
  transforms: ImmutableMap<string, any>,
  theme: string,
  expanded: boolean,
  isHidden: boolean,
}

export default class Display extends React.Component {
  props: Props;

  static defaultProps = {
    transforms,
    displayOrder,
    isHidden: false,
    expanded: true,
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return true;
  }

  render() {
    const order = this.props.displayOrder;
    const tf = this.props.transforms;
    const style = {
      height: this.props.expanded ? '300px' : 'auto',
      overflow: this.props.expanded ? 'scroll' : 'overflow',
    };

    if (!this.props.isHidden) {
      return (
        <div className="cell_display" style={style}>
          {
            this.props.outputs.map((output, index) =>
              <Output
                key={index}
                output={output}
                displayOrder={order}
                transforms={tf}
                theme={this.props.theme}
              />
            )
          }
        </div>
      );
    }
    return null;
  }
}
