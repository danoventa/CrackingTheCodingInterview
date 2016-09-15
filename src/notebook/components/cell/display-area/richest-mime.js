import React from 'react';
import Immutable from 'immutable';

import { richestMimetype, transforms, displayOrder } from 'transformime-react';

export default class RichestMime extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    bundle: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  };

  shouldComponentUpdate(nextProps) {  // eslint-disable-line class-methods-use-this
    return nextProps.theme !== this.props.theme;
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

    console.warn('i am zombo.com');
    console.warn(this.props.theme);

    const Transform = this.props.transforms.get(mimetype);
    const data = this.props.bundle.get(mimetype);
    return <Transform data={data} theme={this.props.theme} />;
  }
}

RichestMime.propTypes = {
  bundle: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  theme: React.PropTypes.string,
};

RichestMime.defaultProps = { transforms, displayOrder };
