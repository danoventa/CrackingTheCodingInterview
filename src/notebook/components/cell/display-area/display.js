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

const DEFAULT_SCROLL_HEIGHT = 300;

export default class Display extends React.Component {
  props: Props;

  static defaultProps = {
    transforms,
    displayOrder,
    isHidden: false,
    expanded: true,
  };

  constructor() {
    super();
    this.recomputeStyle = this.recomputeStyle.bind(this);
  }

  componentDidMount() {
    this.recomputeStyle();
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (!nextProps || !this.props) {
      return false;
    }

    const themeChanged = nextProps.theme && nextProps.theme !== this.props.theme;
    if (themeChanged) {
      return true;
    }

    if (nextProps.outputs && !nextProps.outputs.equals(this.props.outputs)) {
      return true;
    }

    return false;
  }

  componentDidUpdate() {
    this.recomputeStyle();
  }

  recomputeStyle() {
    if (this.el.scrollHeight > DEFAULT_SCROLL_HEIGHT) {
      this.el.style.height = `${DEFAULT_SCROLL_HEIGHT}px`;
      this.el.style.overflowY = 'scroll';
      return;
    }

    this.el.style.height = 'auto';
    this.el.style.overflowY = 'overflow';
  }

  render() {
    const order = this.props.displayOrder;
    const tf = this.props.transforms;

    if (!this.props.isHidden) {
      return (
        <div className="cell_display" ref={(el) => { this.el = el; }}>
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
