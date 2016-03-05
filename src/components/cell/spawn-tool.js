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
      <div className={'spawn-tool ' + (this.props.spawnBefore ? 'above' : 'below')}>
        <span className='spawn-text' onClick={() => this._spawnTextCell()}>+text</span>
        <span className='spawn-code' onClick={() => this._spawnCodeCell()}>+code</span>
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
