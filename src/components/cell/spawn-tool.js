import React from 'react';

import { createCellAfter, createCellBefore } from '../../actions';

export default class SpawnTool extends React.Component {
  static displayName = 'SpawnTool';

  static propTypes = {
    id: React.PropTypes.string,
    spawnBefore: React.PropTypes.bool,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  render() {
    return (
      <div className={'spawn-positioner ' + (this.props.spawnBefore ? 'above' : 'below')}>
        <div className='spawn-tool'>
          <span className='spawn-label'>Add cell</span>
          <button onClick={this._spawnTextCell.bind(this)}>
            <i className='material-icons'>art_track</i>
          </button>
          <button onClick={this._spawnCodeCell.bind(this)}>
            <i className='material-icons'>code</i>
          </button>
        </div>
      </div>
    );
  }

  _spawnCodeCell() {
    if (this.props.spawnBefore) {
      this.context.dispatch(createCellBefore('code', this.props.id));
    } else {
      this.context.dispatch(createCellAfter('code', this.props.id));
    }
  }

  _spawnTextCell() {
    if (this.props.spawnBefore) {
      this.context.dispatch(createCellBefore('markdown', this.props.id));
    } else {
      this.context.dispatch(createCellAfter('markdown', this.props.id));
    }
  }
}
