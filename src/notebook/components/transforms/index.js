import { displayOrder, transforms } from 'transformime-react';

/**
 * Thus begins our path for custom mimetypes and future extensions
 */

import PlotlyTransform from './plotly';
import GeoJSONTransform from './geojson';


const defaultDisplayOrder = displayOrder
  .insert(0, PlotlyTransform.MIMETYPE)
  .insert(0, GeoJSONTransform.MIMETYPE);

const defaultTransforms = transforms
  .set(PlotlyTransform.MIMETYPE, PlotlyTransform)
  .set(GeoJSONTransform.MIMETYPE, GeoJSONTransform);

export { defaultDisplayOrder, defaultTransforms };
