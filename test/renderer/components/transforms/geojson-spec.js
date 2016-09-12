import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import GeoJSONTransform from '../../../../src/notebook/components/transforms/geojson';

describe('GeoJSONTransform', () => {
  it('renders a map', () => {
    const geojson = Immutable.fromJS({
      "type": "FeatureCollection",
      "features": [
          {
              "type": "Feature",
              "properties": {
                  "popupContent": "18th & California Light Rail Stop"
              },
              "geometry": {
                  "type": "Point",
                  "coordinates": [-104.98999178409576, 39.74683938093904]
              }
          },{
              "type": "Feature",
              "properties": {
                  "popupContent": "20th & Welton Light Rail Stop"
              },
              "geometry": {
                  "type": "Point",
                  "coordinates": [-104.98689115047453, 39.747924136466565]
              }
          }
      ]
    });
    const geoComponent = mount(
      <GeoJSONTransform
        data={geojson}
      />
    );

    expect(geoComponent.instance().shouldComponentUpdate()).to.be.false;
    expect(geoComponent.find('.leaflet-container')).to.have.length(1);

  });
});
