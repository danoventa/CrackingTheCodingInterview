import React from 'react';

import CellCreatorButtons from './cell-creator-buttons';

export default class CellCreator extends React.Component {
  static displayName = 'CellCreator';

  static propTypes = {
    above: React.PropTypes.bool,
    id: React.PropTypes.string,
  };

  componentWillMount() {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    this._boundUpdateVisibility = this._updateVisibility.bind(this);
    document.addEventListener('mousemove', this._boundUpdateVisibility, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this._boundUpdateVisibility);
  }

  state = {
    show: false,
  };

  render() {
    return (
      <div className='creator-hover-mask'>
        <div className='creator-hover-region' ref={el => this._el = el}>
          {this.state.show || this.props.id === null ? (<CellCreatorButtons {...this.props} />) : ''}
        </div>
      </div>);
  }

  _updateVisibility(mouseEvent) {
    if (this._el) {
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      const regionRect = this._el.getBoundingClientRect();
      const show = (regionRect.left < x && x < regionRect.right) && (regionRect.top < y && y < regionRect.bottom);
      this.setState({ show });
    }
  }
}
