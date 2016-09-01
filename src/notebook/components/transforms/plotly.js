import React from 'react';

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/json+plotly.v1';

export class PlotlyTransform extends React.Component {
  componentDidMount() {
    const payload = this.props.data.toJS();
    Plotly.newPlot(this.el, payload.data, payload.layout);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { layout } = this.props.data.toJS();
    const style = {};
    if (layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return (
      <div style={style} ref={(el) => this.el = el} /> // eslint-disable-line
    );
  }
}

PlotlyTransform.propTypes = {
  data: React.PropTypes.any,
};

PlotlyTransform.MIMETYPE = MIMETYPE;

export default PlotlyTransform;
