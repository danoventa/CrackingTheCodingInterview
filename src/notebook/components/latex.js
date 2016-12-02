/* @flow */
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { typesetMath } from 'mathjax-electron';

type Props = {
  children?: React.Element<any>,
};

const MathJax: global = window.MathJax;

function isMathJaxOkYet(): boolean {
  return !window.disableMathJax && typeof MathJax !== 'undefined'
                                && window.MathJax
                                && window.MathJax.Hub.Queue;
}

export default class LatexRenderer extends React.Component {
  props: Props;
  shouldComponentUpdate: (p: Props, s: any) => boolean;
  rendered: HTMLElement;

  constructor(): void {
    super();
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  componentDidMount(): void {
    if (isMathJaxOkYet()) typesetMath(this.rendered);
  }

  componentDidUpdate(): void {
    if (isMathJaxOkYet()) typesetMath(this.rendered);
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(rendered) => { this.rendered = rendered; }}>{this.props.children}</div>
    );
  }
}
