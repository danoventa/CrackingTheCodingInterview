import React from 'react';

export default class Provider extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    rx: React.PropTypes.object,
  };
  static childContextTypes = {
    dispatch: React.PropTypes.func,
    store: React.PropTypes.object,
  };
  getChildContext() {
    const { dispatch, store } = this.props.rx;
    return {
      dispatch,
      store,
    };
  }
  render() {
    return this.props.children;
  }
}
