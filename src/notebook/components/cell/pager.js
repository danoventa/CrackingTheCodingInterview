import React from 'react';

import Immutable from 'immutable';

import { richestMimetype } from 'transformime-react';

class Pager extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    data: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  };

  shouldComponentUpdate() { // eslint-disable-line class-methods-use-this
    // It's always brand new
    return false;
  }

  render() {
    const bundle = this.props.data;
    const mimetype = richestMimetype(bundle, this.props.displayOrder, this.props.transforms);
    if (!mimetype) {
      return null;
    }

    const Transform = this.props.transforms.get(mimetype);
    return <Transform data={bundle.get(mimetype)} />;
  }
}

export default Pager;
