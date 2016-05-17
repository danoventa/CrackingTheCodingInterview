import React from 'react';

export default class Provider extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    rx: React.PropTypes.object,
  };
  static childContextTypes = {
    dispatch: React.PropTypes.func,
    store: React.PropTypes.object,
    notificationSystem: React.PropTypes.object,
    hasKernel: React.PropTypes.bool,
  };

  state = {
    notificationSystem: undefined,
    hasKernel: false,
  };

  getChildContext() {
    const { dispatch, store } = this.props.rx;
    const { notificationSystem, hasKernel } = this.state;
    return {
      dispatch,
      store,
      notificationSystem,
      hasKernel,
    };
  }

  componentWillReceiveProps(newProps) {
    const { store } = newProps.rx;
    if (store !== this.store) {
      this.updateStore(store);
    }
  }

  updateStore(store) {
    this.store = store;
    store.subscribe(state => {
      if (state) {
        const { notificationSystem, executionState, channels } = state;
        this.setState({
          notificationSystem,
          hasKernel: channels &&
            !(executionState === 'starting' || executionState === 'not connected'),
        });
      }
    });
  }

  render() {
    return this.props.children;
  }
}
