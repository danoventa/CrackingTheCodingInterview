import React from 'react';

import Immutable from 'immutable';

import { richestMimetype } from 'transformime-react';

const Pager = (props) => {
  const bundle = props.pager.get('data');
  const mimetype = richestMimetype(bundle, props.displayOrder, props.transforms);
  const Transform = props.transforms.get(mimetype);
  return <Transform data={bundle.get(mimetype)} />;
};

Pager.propTypes = {
  displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
  transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  pager: React.PropTypes.instanceOf(Immutable.Map).isRequired,
};

export default Pager;
