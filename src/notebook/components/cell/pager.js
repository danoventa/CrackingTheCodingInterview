import React from 'react';

import Immutable from 'immutable';

import { richestMimetype } from 'transformime-react';

const Pager = (props) => {
  const bundle = props.pagerData.get('data');
  const mimetype = richestMimetype(bundle, props.displayOrder, props.transforms);
  const Transform = props.transforms.get(mimetype);
  return <Transform data={bundle} />;
};

Pager.propTypes = {
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  pagerData: React.PropTypes.instanceOf(Immutable.List),
};

export default Pager;
