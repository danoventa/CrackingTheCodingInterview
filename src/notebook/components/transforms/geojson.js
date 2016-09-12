/* eslint class-methods-use-this: 0 */

import React, { PropTypes } from 'react';

const L = require('leaflet');

L.Icon.Default.imagePath = '../node_modules/leaflet/dist/images/';

const MIMETYPE = 'application/vnd.geo+json';

export class GeoJSONTransform extends React.Component {


  componentDidMount() {
    const map = L.map(this.el);
    map.scrollWheelZoom.disable();
    // TODO: Determine a strategy for picking tiles
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${this.props.theme}`,
    }).addTo(map);
    const geoJSON = this.props.data.toJS();
    const geoJSONLayer = L.geoJson(geoJSON).addTo(map);
    map.fitBounds(geoJSONLayer.getBounds());
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>
        <link rel="stylesheet" href="../node_modules/leaflet/dist/leaflet.css" />
        <div
          ref={(el) => { this.el = el; }}
          style={{ height: '600px', width: '100%' }}
        />
      </div>
    );
  }
}

GeoJSONTransform.propTypes = {
  data: PropTypes.object,
  theme: PropTypes.string,
};

GeoJSONTransform.defaultProps = {
  theme: 'light',
};

GeoJSONTransform.MIMETYPE = MIMETYPE;

export default GeoJSONTransform;
