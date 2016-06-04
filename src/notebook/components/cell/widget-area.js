import React from 'react';
import Immutable from 'immutable';
import Widget from './widget';

const WidgetArea = (props) => (
  <div className="cell-widget-area">
    {props.widgets.map((widgetId, index) =>
      <Widget
        id={widgetId}
        key={`index: ${index}, widgetId: ${widgetId}`}
        cellId={props.id}
        widgetManager={props.widgetManager}
      />
    )}
  </div>
);

WidgetArea.propTypes = {
  id: React.PropTypes.string,
  widgets: React.PropTypes.instanceOf(Immutable.List),
  widgetManager: React.PropTypes.any,
};

export default WidgetArea;
