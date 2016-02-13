import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';

import { setSelected } from '../../actions';

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
  };
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    cell: React.PropTypes.any,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    id: React.PropTypes.string,
    isDragging: React.PropTypes.bool.isRequired,
    isOver: React.PropTypes.bool.isRequired,
    isSelected: React.PropTypes.bool,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.setSelected = this.setSelected.bind(this);
  }

  state = {
    hoverUpperHalf: true,
  };

  setSelected(e) {
    const additive = e.shiftKey;
    this.context.dispatch(setSelected([this.props.id], additive));
  }

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    const selected = this.props.isSelected ? 'selected' : '';
    return this.props.connectDropTarget(this.props.connectDragSource(
      <div
        style={{
          opacity: this.props.isDragging ? 0.25 : 1,
          borderTop: (this.props.isOver && this.state.hoverUpperHalf) ?
            '5px limegreen solid' : '0px transparent solid',
          borderBottom: (this.props.isOver && !this.state.hoverUpperHalf) ?
            '5px limegreen solid' : '0px transparent solid',
        }}
        onClick={this.setSelected}
        className={'cell ' + selected}>
        {
        type === 'markdown' ?
          <MarkdownCell {...this.props}/> :
          <CodeCell {...this.props}/>
        }
      </div>
    ));
  }
}

export default DragSource('CELL', cellSource, collectSource)(DropTarget('CELL', cellTarget, collectTarget)(Cell));
