import React from 'react';

export default class Provider extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    rx: React.PropTypes.object,
    notificationSystem: React.PropTypes.object,
    channels: React.PropTypes.object,
    executionState: React.PropTypes.string,
  };
  static childContextTypes = {
    dispatch: React.PropTypes.func,
    store: React.PropTypes.object,
    notificationSystem: React.PropTypes.object,
    kernelConnected: React.PropTypes.bool,
  };

  getChildContext() {
    const { notificationSystem, executionState, channels, rx } = this.props;
    const { dispatch, store } = rx;
    const kernelConnected = channels &&
      !(executionState === 'starting' || executionState === 'not connected');
    return {
      dispatch,
      store,
      notificationSystem,
      kernelConnected,
    };
  }

  render() {
    return this.props.children;
  }
}
