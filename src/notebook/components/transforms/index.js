import Immutable from 'immutable';

import TextDisplay from './text';
import JavaScriptDisplay from './javascript';
import HTMLDisplay from './html';
import MarkdownDisplay from './markdown';
import LaTeXDisplay from './latex';

import {
  PNGDisplay,
  JPEGDisplay,
  GIFDisplay,
} from './image';

/**
 * Thus begins our path for custom mimetypes and future extensions
 */
import PlotlyTransform from './plotly';
import GeoJSONTransform from './geojson';

export const standardTransforms = new Immutable.Map({
  'text/plain': TextDisplay,
  'image/png': PNGDisplay,
  'image/jpeg': JPEGDisplay,
  'image/gif': GIFDisplay,
  'text/html': HTMLDisplay,
  'text/markdown': MarkdownDisplay,
  'text/latex': LaTeXDisplay,
  'application/javascript': JavaScriptDisplay,
});

export const standardDisplayOrder = new Immutable.List([
  'application/javascript',
  'text/html',
  'text/markdown',
  'text/latex',
  'image/svg+xml',
  'image/gif',
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
]);


// Register custom transforms
const transforms = standardTransforms
  .set(PlotlyTransform.MIMETYPE, PlotlyTransform)
  .set(GeoJSONTransform.MIMETYPE, GeoJSONTransform);

// Register our custom transforms as the most rich (front of List)
const displayOrder = standardDisplayOrder
  .insert(0, PlotlyTransform.MIMETYPE)
  .insert(0, GeoJSONTransform.MIMETYPE);

/**
 * Choose the richest mimetype available based on the displayOrder and transforms
 * @param  {Immutable.Map}   bundle - Map({mimetype1: data1, mimetype2: data2, ...})
 * @param  {Immutable.List}  ordered list of mimetypes - List(['text/html', 'text/plain'])
 * @param  {Immutable.Map}   mimetype -> React Component - Map({'text/plain': TextTransform})
 * @return {string}          Richest mimetype
 */
function richestMimetype(bundle, order = displayOrder, tf = transforms) {
  return bundle.keySeq()
                // we can only use those we have a transform for
                .filter((mimetype) => tf.has(mimetype) && order.includes(mimetype))
                // the richest is based on the order in displayOrder
                .sortBy((mimetype) => order.indexOf(mimetype))
                .first();
}

export {
  displayOrder,
  transforms,
  richestMimetype,
};
