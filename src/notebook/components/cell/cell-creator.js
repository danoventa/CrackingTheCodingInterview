import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import CellCreatorButtons from './cell-creator-buttons';

export default class CellCreator extends React.Component {
  static propTypes = {
    above: React.PropTypes.bool,
    id: React.PropTypes.string,
  };

  constructor() {
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.setHoverElement = this.setHoverElement.bind(this);
    this.updateVisibility = this.updateVisibility.bind(this);
  }

  state = {
    show: false,
  };

  componentDidMount() {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.updateVisibility, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.updateVisibility);
  }

  setHoverElement(el) {
    this.hoverElement = el;
  }

  updateVisibility(mouseEvent) {
    if (this.hoverElement) {
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      const regionRect = this.hoverElement.getBoundingClientRect();
      const show = (regionRect.left < x && x < regionRect.right) &&
                   (regionRect.top < y && y < regionRect.bottom);
      this.setState({ show });
    }
  }


  render() {
    return (
      <div className="creator-hover-mask">
        <div className="creator-hover-region" ref={this.setHoverElement}>
          {this.state.show || this.props.id === null ?
            (<CellCreatorButtons above={this.props.above} id={this.props.id} />) :
            ''}
        </div>
      </div>);
  }

}
