/* @flow */
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { loadMathJax, typesetMath } from 'mathjax-electron';

type Props = {
  children?: React.Element<any>,
};

const MathJax: global = window.MathJax;

// Initialize the mathjax renderer.
// TODO: When MathJax is loaded, all components should likely re-render
// WARNING: Tech debt here. MathJax should likely be included on the page ahead
//          of time.
loadMathJax(document);

function isMathJaxOkYet(): boolean {
  return !window.disableMathJax && typeof MathJax !== 'undefined'
                                && window.MathJax
                                && window.MathJax.Hub.Queue;
}

export default class LatexRenderer extends React.Component {
  props: Props;
  shouldComponentUpdate: (p: Props, s: any) => boolean;

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
