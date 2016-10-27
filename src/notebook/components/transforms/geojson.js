/* @flow */
/* eslint class-methods-use-this: 0 */
import React, { PropTypes } from 'react';

type Props = {
  data: Object,
  theme: string,
};

const L = require('leaflet');

L.Icon.Default.imagePath = '../node_modules/leaflet/dist/images/';

const MIMETYPE = 'application/geo+json';

export class GeoJSONTransform extends React.Component {
  props: Props;
  MIMETYPE: string;
  map: Object;
  el: HTMLElement;

  static defaultProps = {
    theme: 'light',
  };

  static MIMETYPE = MIMETYPE;

  componentDidMount(): void {
    // HACK: Work around for testing Leaflet in JSDOM
    // see: https://github.com/Leaflet/Leaflet/issues/4823
    if (!this.el.clientWidth && !this.el.clientHeight) {
      this.el.clientHeight = 600;
      this.el.clientWidth = 1000;
    }
    this.map = L.map(this.el);
    this.map.scrollWheelZoom.disable();
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${this.props.theme}`,
    }).addTo(this.map);
    const geoJSON = this.props.data.toJS();
    const geoJSONLayer = L.geoJson(geoJSON).addTo(this.map);
    this.map.fitBounds(geoJSONLayer.getBounds());
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (nextProps && nextProps.theme && this.props && nextProps.theme !== this.props.theme) {
      return true;
    }
    return false;
  }

  componentDidUpdate(): void {
    const theme = this.props.theme === 'light' ||
                    this.props.theme === 'dark' ? this.props.theme : 'light';

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${theme}`,
    }).addTo(this.map);
  }

  render(): ?React.Element<any> {
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

export default GeoJSONTransform;
