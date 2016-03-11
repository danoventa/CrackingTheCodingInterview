import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import Cell from './cell';

const cellSource = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  },
};

function isDragUpper(props, monitor, component) {
  const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  const clientOffset = monitor.getClientOffset();
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  return hoverClientY < hoverMiddleY;
}

const cellTarget = {
  drop(props, monitor, component) {
    const hoverUpperHalf = isDragUpper(props, monitor, component);
    props.moveCell(monitor.getItem().id, props.id, hoverUpperHalf);
  },

  hover(props, monitor, component) {
    component.setState({ hoverUpperHalf: isDragUpper(props, monitor, component) });
  },
};

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
  };
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class DraggableCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    connectDragPreview: React.PropTypes.func.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    id: React.PropTypes.string,
    isDragging: React.PropTypes.bool.isRequired,
    isOver: React.PropTypes.bool.isRequired,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  state = {
    hoverUpperHalf: true,
  };

  componentDidMount() {
    const connectDragPreview = this.props.connectDragPreview;
    const img = new Image();
    img.src = [
      'data:image/png;base64,',
      'iVBORw0KGgoAAAANSUhEUgAAADsAAAAzCAYAAAApdnDeAAAAAXNSR0IArs4c6QAA',
      'AwNJREFUaAXtmlFL3EAUhe9MZptuoha3rLWgYC0W+lj/T3+26INvXbrI2oBdE9km',
      'O9Nzxu1S0LI70AQScyFmDDfkfvdMZpNwlCCccwq7f21MaVM4FPtkU0o59RdoJBMx',
      'WZINBg+DQWGKCAk+2kIKFh9JlSzLYVmOilEpR1Kh/iUbQFiNQTSbzWJrbYJximOJ',
      'cSaulpVRoqh4K8JhjprIVJWqFlCpQNG51roYj8cLjJcGf5RMZWC1TYw1o2LxcEmy',
      '0jeEo3ZFWVHIx0ji4eeKHFOx8l4sVVVZnBE6tWLHq7xO7FY86YpPeVjeo5y61tlR',
      'JyhXEOQhF/lw6BGWixHvUWXVTpdgyUMu8q1h/ZJbqQhdiLsESx4FLvL9gcV6q3Cs',
      '0liq2IHuBHjItYIV3rMvJnrYrkrdK9sr24EO9NO4AyI+i/CilOXbTi1xeXXFTyAS',
      'GSOfzs42XmM+v5fJ5JvP29/fl8PDw43nhCbUpuzFxYXs7OxKmqZb1WQGkc/P80K+',
      'T6dbnROaVJuyfPY+Pj7aup7h66HP/1Uu5O7u59bnhSTWpmxIEU3l9rBNdbrp6/TK',
      'Nt3xpq7XK9tUp5u+Tm2/s/jYJdfX12LwBHVycrKRK89zmeJhYnZ7K3Fcz3e/2mDP',
      'z7/waZEf8zaC+gSkKa3l4OBA3uztbXdOYFZtsKcfToNKSZNUPp6GnRN0AST3C1Ro',
      'x9qS3yvbFqVC6+yVDe1YW/J7ZduiVGidvbKhHWtLfq9sW5QKrdMri9cxB6OFhQmO',
      'TrDuBHjIRT5CEZZj0i7xOkYnWGeCPOQiHqC8lc/R60cLnNPuvjOkns7dk4t8/Jfv',
      's46mRlWqQiudxebVV3gAj7C9hXsmgZeztnfe/91YODEr3IoF/JY/sE2gbGaVLci3',
      'hh0tRtWNvsm16JmNcOs6N9dW72LP7yOtWbEhjAUkZ+icoJ5HbE6+NSxMjKWe6cKb',
      'GkUWgMwiFbXSlRpFkXelUlF4F70rVd7Bd4oZ/LL8xiDmtPV2Nwyf2zOlTfHERY7i',
      'Haa1+w2+iFqx0aIgvgAAAABJRU5ErkJggg==',
    ].join('');
    img.onload = function dragImageLoaded() {
      connectDragPreview(img);
    };
  }

  render() {
    return this.props.connectDropTarget(this.props.connectDragSource(
      <div
        style={{
          opacity: this.props.isDragging ? 0.25 : 1,
          borderTop: (this.props.isOver && this.state.hoverUpperHalf) ?
            '3px lightgray solid' : '3px transparent solid',
          borderBottom: (this.props.isOver && !this.state.hoverUpperHalf) ?
            '3px lightgray solid' : '3px transparent solid',
        }}
        className={'draggable-cell'}
      >
        {
          <Cell {...this.props} />
        }
      </div>
    ));
  }
}

const source = new DragSource('CELL', cellSource, collectSource);
const target = new DropTarget('CELL', cellTarget, collectTarget);
export default source(target(DraggableCell));
