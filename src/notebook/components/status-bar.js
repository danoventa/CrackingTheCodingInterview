import React from 'react';
import moment from 'moment';

export default class StatusBar extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any,
    lastSaved: React.PropTypes.instanceOf(Date),
  };

  constructor(props) {
    super(props);
    console.log(this.props.lastSaved);
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
          <p>nteract</p>
        </span>
      </div>
    );
  }
}
