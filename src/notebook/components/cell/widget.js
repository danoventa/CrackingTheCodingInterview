import React from 'react';
import ReactDOM from 'react-dom';

export default class Widget extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    cellId: React.PropTypes.string,
    widgetManager: React.PropTypes.any,
  };

  componentDidUpdate() {
    if (this.refs.placeholder) {
      const placeholder = ReactDOM.findDOMNode(this.refs.placeholder);
      if (placeholder && placeholder.parentNode) {
        this.props.widgetManager.createViewForModel(
          this.props.id,
          this.props.cellId
        ).then(view => {
          this.disposeView();
          placeholder.parentNode.replaceChild(view.el, placeholder);
          this.view = view;
        });
      }
    }
  }

  componentWillUnmount() {
    this.disposeView();
  }

  disposeView() {
    if (this.view) {
      // TODO: Clean-up on unmount
      delete this.view;
    }
  }

  render() {
    return <div className="widget-placeholder" ref="placeholder" />;
  }
}
