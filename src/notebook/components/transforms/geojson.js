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
  geoJSONLayer: Object;
  tileLayer: Object;

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

    this.tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: `mapbox.${this.props.theme}`,
    }).addTo(this.map);

    const geoJSON = this.props.data.toJS();

    this.geoJSONLayer = L.geoJson(geoJSON).addTo(this.map);
    this.map.fitBounds(this.geoJSONLayer.getBounds());
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    if (nextProps.theme !== this.props.theme ||
        this.props.data !== nextProps.data) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.theme !== this.props.theme) {
      const theme = this.props.theme === 'light' ||
                    this.props.theme === 'dark' ? this.props.theme : 'light';
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        id: `mapbox.${this.props.theme}`,
      }).addTo(this.map);
    }

    if (prevProps.data !== this.props.data) {
      const geoJSON = this.props.data.toJS();

      this.map.removeLayer(this.geoJSONLayer);
      this.geoJSONLayer = L.geoJson(geoJSON).addTo(this.map);
      this.map.fitBounds(this.geoJSONLayer.getBounds());
    }
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
