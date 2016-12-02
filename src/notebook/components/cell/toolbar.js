/* eslint class-methods-use-this: 0 */
// @flow
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import {
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  changeOutputVisibility,
  changeInputVisibility,
  changeCellType,
  toggleOutputExpansion,
} from '../../actions';

type Props = {
  cell: any,
  id: string,
  type: string,
}

export default class Toolbar extends React.Component {
  shouldComponentUpdate: (p: Props, s: any) => boolean;
  removeCell: () => void;
  executeCell: () => void;
  clearOutputs: () => void;
  toggleStickyCell: () => void;
  changeInputVisibility: () => void;
  changeOutputVisibility: () => void;
  changeCellType: () => void;
  dropdown: Dropdown;
  toggleOutputExpansion: () => void;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(props: Props): void {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  toggleStickyCell(): void {
    this.context.store.dispatch(toggleStickyCell(this.props.id));
  }

  removeCell(): void {
    this.context.store.dispatch(removeCell(this.props.id));
  }

  executeCell(): void {
    this.context.store.dispatch(executeCell(
                                      this.props.id,
                                      this.props.cell.get('source')));
  }

  clearOutputs(): void {
    this.dropdown.hide();
    this.context.store.dispatch(clearOutputs(this.props.id));
  }

  changeInputVisibility(): void {
    this.dropdown.hide();
    this.context.store.dispatch(changeInputVisibility(this.props.id));
  }

  changeOutputVisibility(): void {
    this.dropdown.hide();
    this.context.store.dispatch(changeOutputVisibility(this.props.id));
  }

  changeCellType(): void {
    this.dropdown.hide();
    const to = this.props.type === 'markdown' ? 'code' : 'markdown';
    this.context.store.dispatch(changeCellType(this.props.id, to));
  }

  toggleOutputExpansion(): void {
    this.context.store.dispatch(toggleOutputExpansion(this.props.id));
  }

  render(): ?React.Element<any> {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {showPlay &&
          <span>
            <button onClick={this.executeCell} className="executeButton" >
              <span className="octicon octicon-triangle-right" />
            </button>
          </span>}
          <button onClick={this.removeCell} className="deleteButton" >
            <span className="octicon octicon-trashcan" />
          </button>
          <button onClick={this.toggleStickyCell} className="stickyButton" >
            <span className="octicon octicon-pin" />
          </button>
          <Dropdown ref={(dropdown) => { this.dropdown = dropdown; }}>
            <DropdownTrigger>
              <button>
                <span className="octicon octicon-chevron-down" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              {
              (this.props.type === 'code') ?
                <ul>
                  <li onClick={this.clearOutputs} className="clearOutput" >
                    <a>Clear Cell Output</a>
                  </li>
                  <li onClick={this.changeInputVisibility} className="inputVisibility" >
                    <a>Toggle Input Visibility</a>
                  </li>
                  <li onClick={this.changeOutputVisibility} className="outputVisibility" >
                    <a>Toggle Output Visibility</a>
                  </li>
                  <li onClick={this.toggleOutputExpansion} className="outputExpanded" >
                    <a>Toggle Expanded Output</a>
                  </li>
                </ul> : null
              }
              <ul>
                <li onClick={this.changeCellType} className="changeType" >
                  <a>
                    Convert to {this.props.type === 'markdown' ? 'Code' : 'Markdown'} Cell
                  </a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    );
  }
}
