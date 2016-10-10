/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
}

export default class HTMLDisplay extends React.Component {
  props: Props;

  componentDidMount(): void {
    if (this.refs.here) {
      if (document.createRange && Range && Range.prototype.createContextualFragment) {
        const range = document.createRange();
        const fragment = range.createContextualFragment(this.props.data);
        ReactDOM.findDOMNode(this.refs.here).appendChild(fragment);
      } else {
        ReactDOM.findDOMNode(this.refs.here).innerHTML = this.props.data;
      }
    }
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  render(): ?React.Element<any> {
    return (
      <div ref="here" />
    );
  }
}
