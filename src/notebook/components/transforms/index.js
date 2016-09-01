import { displayOrder, transforms } from 'transformime-react';

/**
 * Thus begins our path for custom mimetypes and future extensions
 */

import PlotlyTransform from './plotly';

const defaultDisplayOrder = displayOrder
  .splice(0, 0, PlotlyTransform.MIMETYPE);

const defaultTransforms = transforms
  .set(PlotlyTransform.MIMETYPE, PlotlyTransform);

export { defaultDisplayOrder, defaultTransforms };
