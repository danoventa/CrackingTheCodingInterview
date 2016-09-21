import React from 'react';

export default class StatusBar extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {
      isModified: false,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.notebook !== nextProps) {
      return true;
    }
    return false;
  }

  componentWillRecieveProps(newProps) {
    this.setState({
      isModified: true,
    });
  }

  render() {
    return (
      <div className="status-bar">
        <span>
          <p>nteract</p>
        </span>
        <span>
          <p>{this.state.isModified ? Modified : ''}</p>
        </span>
      </div>
    );
  }
}
