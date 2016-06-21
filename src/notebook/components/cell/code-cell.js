import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';
import LatexRenderer from '../latex';

import Pager from './pager';

import Immutable from 'immutable';

class CodeCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    outputStatuses: React.PropTypes.instanceOf(Immutble.Map).isRequired,
    getCompletions: React.PropTypes.func,
    id: React.PropTypes.string,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    focused: React.PropTypes.bool,
    pagers: React.PropTypes.instanceOf(Immutable.List),
    running: React.PropTypes.bool,
    focusAbove: React.PropTypes.func,
    focusBelow: React.PropTypes.func,
  };

  static defaultProps = {
    pagers: new Immutable.List(),
    running: false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  isHidden() {
    return this.props.outputStatuses.getIn([this.props.id, 'isHidden']);
  }

  render() {
    return (<div>
      <div className="input-container">
        <Inputs
          executionCount={this.props.cell.get('execution_count')}
          running={this.props.running}
        />
        <Editor
          id={this.props.id}
          input={this.props.cell.get('source')}
          language={this.props.language}
          focused={this.props.focused}
          getCompletions={this.props.getCompletions}
          theme={this.props.theme}
          focusAbove={this.props.focusAbove}
          focusBelow={this.props.focusBelow}
        />
      </div>
      {
        this.props.pagers && !this.props.pagers.isEmpty() ?
          <div className="pagers">
          {
            this.props.pagers.map((pager, key) =>
              <Pager
                className="pager"
                displayOrder={this.props.displayOrder}
                transforms={this.props.transforms}
                pager={pager}
                key={key}
              />
            )
          }
          </div> : null
      }
      <LatexRenderer>
        <div className="outputs">
          <Display
            className="outputs-display"
            outputs={this.props.cell.get('outputs')}
            isHidden={this.isHidden}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
          />
        </div>
      </LatexRenderer>
    </div>);
  }
}

export default CodeCell;
