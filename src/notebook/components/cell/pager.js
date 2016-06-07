import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Immutable from 'immutable';

import { richestMimetype } from 'transformime-react';

class Pager extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    pager: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const bundle = this.props.pager.get('data');
    const mimetype = richestMimetype(bundle, this.props.displayOrder, this.props.transforms);
    const Transform = this.props.transforms.get(mimetype);
    return <Transform data={bundle.get(mimetype)} />;
  }
}

export default Pager;
