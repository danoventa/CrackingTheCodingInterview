import React, { PropTypes } from 'react';

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/vnd.plotly.v1+json';

export class PlotlyTransform extends React.Component {
  static shouldComponentUpdate() {
    return false;
  }

  constructor() {
    super();
    this.getFigure = this.getFigure.bind(this);
  }

  componentDidMount() {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    Plotly.newPlot(this.el, figure.data, figure.layout);
  }


  getFigure() {
    const figure = this.props.data;
    if (typeof figure === 'string') {
      return JSON.parse(figure);
    }
    // assume immutable.js
    return figure.toJS();
  }

  render() {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return (
      <div style={style} ref={(el) => this.el = el} /> // eslint-disable-line
    );
  }
}

PlotlyTransform.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

PlotlyTransform.MIMETYPE = MIMETYPE;

export default PlotlyTransform;
