import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { loadMathJax, typesetMath } from 'mathjax-electron';

// Initialize the mathjax renderer.
// TODO: When MathJax is loaded, all components should likely re-render
// WARNING: Tech debt here. MathJax should likely be included on the page ahead
//          of time.
loadMathJax(document);

function isMathJaxOkYet() {
  return !window.disableMathJax && typeof MathJax !== 'undefined'
                                && window.MathJax
                                && window.MathJax.Hub.Queue;
}

export default class LatexRenderer extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (isMathJaxOkYet()) typesetMath(this.refs.rendered);
  }

  componentDidUpdate() {
    if (isMathJaxOkYet()) typesetMath(this.refs.rendered);
  }

  render() {
    return (
      <div ref="rendered">{this.props.children}</div>
    );
  }
}
