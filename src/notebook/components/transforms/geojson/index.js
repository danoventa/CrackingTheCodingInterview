import React from 'react';

const L = require('leaflet');
L.Icon.Default.imagePath = '../node_modules/leaflet/dist/images/';

const MIMETYPE = 'application/vnd.geojson.v1+json';

export class GeoJSONTransform extends React.Component {
  componentDidMount() {
    const map = L.map(this.el);
    L.geoJson(this.props.data.toJS()).addTo(map);
  }

  shouldComponentUpdate() {
    return false;
  }
  
  render() {
    return (
      <div>
        <link rel="stylesheet" href="../node_modules/leaflet/dist/leaflet.css"/>
        <div ref={(el) => this.el = el}/>
      </div>
    );
  }
}

GeoJSONTransform.propTypes = {
  data: React.PropTypes.any,
};

GeoJSONTransform.MIMETYPE = MIMETYPE;

export default GeoJSONTransform;
