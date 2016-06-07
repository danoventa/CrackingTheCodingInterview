import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { loadMathJax, mathProcessor } from 'mathjax-electron';

// Initialize the mathjax renderer.
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
    if (!window.disableMathJax) mathProcessor(this.refs.rendered);
  }

  componentDidUpdate() {
    if (!window.disableMathJax) mathProcessor(this.refs.rendered);
  }

  render() {
    return (
      <div ref="rendered">{this.props.children}</div>
    );
  }
}
