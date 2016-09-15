import React from 'react';
import Immutable from 'immutable';

import { richestMimetype, transforms, displayOrder } from 'transformime-react';

export default class RichestMime extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    bundle: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  };

  shouldComponentUpdate() {  // eslint-disable-line class-methods-use-this
    return false;
  }

  render() {
    const mimetype = richestMimetype(
      this.props.bundle,
      this.props.displayOrder,
      this.props.transforms
    );

    if (!mimetype) {
      // If no mimetype is supported, don't return a component
      return null;
    }

    const Transform = this.props.transforms.get(mimetype);
    const data = this.props.bundle.get(mimetype);
    return <Transform data={data} />;
  }
}

RichestMime.propTypes = {
  bundle: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  transforms: React.PropTypes.instanceOf(Immutable.Map),
};

RichestMime.defaultProps = { transforms, displayOrder };
