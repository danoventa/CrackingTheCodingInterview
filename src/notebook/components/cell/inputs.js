// @flow
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

type Props = {
  executionCount: any,
  running: boolean,
};

export default class Inputs extends React.Component {
  props: Props;

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { executionCount, running } = this.props;
    const count = !executionCount ? ' ' : executionCount;
    const input = running ? '*' : count;
    return (
      <div className="prompt">
        [{input}]
      </div>
    );
  }
}
