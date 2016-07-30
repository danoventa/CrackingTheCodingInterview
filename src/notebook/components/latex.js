import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { loadMathJax, typesetMath } from 'mathjax-electron';

// Initialize the mathjax renderer.
// TODO: When MathJax is loaded, all components should likely re-render
// TODO: Alternate - include MathJax in the page ahead of time (app startup)
loadMathJax(document);

export default class LatexRenderer extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (!window.disableMathJax && window.MathJax) typesetMath(this.refs.rendered);
  }

  componentDidUpdate() {
    if (!window.disableMathJax && window.MathJax) typesetMath(this.refs.rendered);
  }

  render() {
    return (
      <div ref="rendered">{this.props.children}</div>
    );
  }
}
