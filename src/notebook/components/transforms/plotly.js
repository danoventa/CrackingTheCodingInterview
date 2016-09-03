import React from 'react';

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/vnd.plotly.v1+json';

export class PlotlyTransform extends React.Component {
  componentWillMount() {
    // Handle case of either string to be `JSON.parse`d or pure object
    let figure = this.props.data;

    if (typeof figure === 'string') {
      figure = JSON.parse(figure);
    } else { // assume immutable.js
      figure = figure.toJS();
    }

    this.setState({ figure });
  }

  componentDidMount() {
    Plotly.newPlot(this.el, this.state.figure.data, this.state.figure.layout);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { layout } = this.state.figure;
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
  data: React.PropTypes.any,
};

PlotlyTransform.MIMETYPE = MIMETYPE;

export default PlotlyTransform;
