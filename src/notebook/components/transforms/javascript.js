/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
};

export default class JavaScript extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    // Compatibility with Jupyter/notebook JS evaluation.  Set element so
    // the user has a handle on the context of the current output.
    const element = this.el;
    try {
      eval(this.props.data); // eslint-disable-line no-eval
    } catch (err) {
      const pre = document.createElement('pre');
      if (err.stack) {
        pre.textContent = err.stack;
      } else {
        pre.textContent = err;
      }
      element.appendChild(pre);
    }
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
