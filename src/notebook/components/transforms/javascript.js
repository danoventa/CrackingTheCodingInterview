/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
};

export default class JavaScript extends React.Component {
  props: Props;

  componentDidMount(): void {
    if (this.refs.here) {
      try {
        // Compatibility with Jupyter/notebook JS evaluation.  Set element so
        // the user has a handle on the context of the current output.
        const element = ReactDOM.findDOMNode(this.refs.here); // eslint-disable-line
        eval(this.props.data); // eslint-disable-line
      } catch (err) {
        console.error('Could not execute user Javascript', err); //eslint-disable-line
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
