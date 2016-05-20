import React from 'react';
import Immutable from 'immutable';
import Widget from './widget';

const WidgetArea = (props) => (
  <div className="cell-widget-area">
    {props.widgets.map(widgetId =>
      <Widget
        id={widgetId}
        key={widgetId}
        cellId={props.id}
        widgetManager={props.widgetManager}
      />
    )}
  </div>
);

WidgetArea.prototype.propTypes = {
  id: React.PropTypes.string,
  widgets: React.PropTypes.instanceOf(Immutable.List),
  widgetManager: React.PropTypes.any,
};

export default WidgetArea;
