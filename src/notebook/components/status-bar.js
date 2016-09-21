import React from 'react';
import moment from 'moment';

export default class StatusBar extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any,
    lastSaved: React.PropTypes.instanceOf(Date),
    kernelSpecName: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.notebook !== nextProps.notebook || 
        this.props.lastSaved !== nextProps.lastSaved) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className="status-bar">
        <span className="pull-right">
        { this.props.lastSaved ? 
          <p> Last saved {moment(this.props.lastSaved).fromNow()} </p> :
          <p> Not saved yet </p>
        }
        </span>
        <span>
          <p>nteract | {this.props.kernelSpecName}</p>
        </span>
      </div>
    );
  }
}
