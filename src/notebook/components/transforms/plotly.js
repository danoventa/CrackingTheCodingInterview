import React from 'react';

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/vnd.plotly.v1+json';

export class PlotlyTransform extends React.Component {
  componentWillMount() {
    // Handle case of either string to be `JSON.parse`d or pure object
    let data = this.props.data;

    if (typeof data === 'string') {
      data = JSON.parse(data);
    } else { // assume immutable.js
      data = data.toJS();
    }

    this.setState({ data });
  }

  componentDidMount() {
    const payload = this.props.data.toJS();
    Plotly.newPlot(this.el, payload.data, payload.layout);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { layout } = this.state.data;
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
