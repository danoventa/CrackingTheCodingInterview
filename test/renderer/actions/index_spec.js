import { expect } from 'chai';
import path from 'path';

import * as actions from '../../../src/notebook/actions';

import * as constants from '../../../src/notebook/constants';

import { dummyStore } from '../../utils';

import {
  dummyJSON,
  dummyCommutable
} from '../dummy-nb';

import {
  fromJS
} from 'immutable';

const Rx = require('rxjs/Rx');

describe('setExecutionState', () => {
  it('creates a SET_EXECUTION_STATE action', () => {
    expect(actions.setExecutionState('idle')).to.deep.equal({
      type: constants.SET_EXECUTION_STATE,
      executionState: 'idle',
    });
  })
});

describe('setLanguageInfo', () => {
  it('creates a SET_LANGUAGE_INFO action', () => {
    const langInfo = {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name":"python",
      "nbconvert_exporter":"python",
      "pygments_lexer":"ipython3",
      "version":"3.5.1",
    };

    expect(actions.setLanguageInfo(langInfo)).to.deep.equal({
      type: constants.SET_LANGUAGE_INFO,
      langInfo: langInfo,
    });
  })
});

describe('newKernel', () => {
  it('creates a NEW_KERNEL action', (done) => {
    actions.newKernel('python2', '.')()
      .first()
      .subscribe((action) => {
        expect(action.type).to.equal(constants.NEW_KERNEL);
        expect(action.kernelSpecName).to.equal('python2');
        done();
      }, (action) => {
        expect.fail();
      });
  });
});

describe('save', () => {
  it('creates a START_SAVING action', (done) => {
    actions.save('test/test-save.ipynb', dummyCommutable)()
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.START_SAVING,
        });
        done();
      }, (action) => {
        expect.fail();
      });
  });
});

describe('saveAs', () => {
  it('creates a CHANGE_FILENAME action', (done) => {
    actions.saveAs('test/test-ipynb-saveas.ipynb', dummyCommutable)(actions, dummyStore())
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.CHANGE_FILENAME,
          filename: 'test/test-ipynb-saveas.ipynb'
        });
        done();
      }, (action) => {
        expect.fail();
      });
  });
});

describe('setNotebook', () => {
  it('creates a SET_NOTEBOOK action', () => {
    actions.setNotebook(dummyJSON, 'test/test-ipynb.ipynb')(actions, dummyStore())
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.SET_NOTEBOOK,
          data: fromJS(dummyJSON)
        });
      }, (action) => {
        expect.fail()
      });
  });
});

describe('updateCellSource', () => {
  it('creates a UPDATE_CELL_SOURCE action', () => {
    expect(actions.updateCellSource('1234', '# test')).to.deep.equal({
      type: constants.UPDATE_CELL_SOURCE,
      id: '1234',
      source: '# test',
    });
  })
});

describe('updateCellOutputs', () => {
  it('creates a UPDATE_CELL_OUTPUTS action', () => {
    expect(actions.updateCellOutputs('1234', {'data': 'woo'})).to.deep.equal({
      type: constants.UPDATE_CELL_OUTPUTS,
      id: '1234',
      outputs: {'data': 'woo'},
    });
  })
});

describe('updateCellExecutionCount', () => {
  it('creates a UPDATE_CELL_EXECUTION_COUNT action', () => {
    expect(actions.updateCellExecutionCount('1234', 3)).to.deep.equal({
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id: '1234',
      count: 3,
    });
  })
});

describe('updateCellPagers', () => {
  it('creates a UPDATE_CELL_PAGERS action', () => {
    expect(actions.updateCellPagers('1234', {'data': 'woo'})).to.deep.equal({
      type: constants.UPDATE_CELL_PAGERS,
      id: '1234',
      pagers: {'data': 'woo'},
    });
  })
});



describe('moveCell', () => {
  it('creates a MOVE_CELL action', () => {
    expect(actions.moveCell('1234', '5678', true)).to.deep.equal({
      type: constants.MOVE_CELL,
      id: '1234',
      destinationId: '5678',
      above: true,
    });
  })
});

describe('removeCell', () => {
  it('creates a REMOVE_CELL action', () => {
    expect(actions.removeCell('1234')).to.deep.equal({
      type: constants.REMOVE_CELL,
      id: '1234',
    });
  });
});

describe('focusCell', () => {
  it('creates a FOCUS_CELL action', () => {
    expect(actions.focusCell('1234')).to.deep.equal({
      type: constants.FOCUS_CELL,
      id: '1234',
    });
  });
});

describe('focusNextCell', () => {
  it('creates a FOCUS_NEXT_CELL action', () => {
    expect(actions.focusNextCell('1234')).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL,
      id: '1234',
      createCellIfUndefined: undefined,
    });
  });
  it('creates a FOCUS_NEXT_CELL action with cell creation flag', () => {
    expect(actions.focusNextCell('1234', true)).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL,
      id: '1234',
      createCellIfUndefined: true,
    });
  });
});

describe('focusNextCell', () => {
  it('creates a FOCUS_PREVIOUS_CELL action', () => {
    expect(actions.focusPreviousCell('1234')).to.deep.equal({
      type: constants.FOCUS_PREVIOUS_CELL,
      id: '1234',
    });
  });
});

describe('createCellAfter', () => {
  it('creates a NEW_CELL_AFTER action with default empty source string', () => {
    expect(actions.createCellAfter('markdown', '1234')).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: '',
      cellType: 'markdown',
      id: '1234',
    });
  });
  it('creates a NEW_CELL_AFTER action with provided source string', () => {
    expect(actions.createCellAfter('code', '1234', 'print("woo")')).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: 'print("woo")',
      cellType: 'code',
      id: '1234',
    });
  });
});

describe('createCellBefore', () => {
  it('creates a NEW_CELL_BEFORE action', () => {
    expect(actions.createCellBefore('markdown', '1234')).to.deep.equal({
      type: constants.NEW_CELL_BEFORE,
      cellType: 'markdown',
      id: '1234',
    });
  });
});

describe('toggleStickyCell', () => {
  it('creates a TOGGLE_STICKY_CELL action', () => {
    expect(actions.toggleStickyCell('1234')).to.deep.equal({
      type: constants.TOGGLE_STICKY_CELL,
      id: '1234',
    });
  });
});

describe('createCellAppend', () => {
  it('creates a NEW_CELL_APPEND action', () => {
    expect(actions.createCellAppend('markdown')).to.deep.equal({
      type: constants.NEW_CELL_APPEND,
      cellType: 'markdown',
    });
  });
});

describe('mergeCellAfter', () => {
  it('creates a MERGE_CELL_AFTER action', () => {
    expect(actions.mergeCellAfter('0121')).to.deep.equal({
      type: constants.MERGE_CELL_AFTER,
      id: '0121',
    });
  });
});

describe('setNotificationSystem', () => {
  it('creates a SET_NOTIFICATION_SYSTEM action', () => {
    expect(actions.setNotificationSystem(null)).to.deep.equal({
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: null,
    });
  });
});

describe('overwriteMetadata', () => {
  it('creates an OVERWRITE_METADATA_FIELD', () => {
    expect(actions.overwriteMetadata('foo', {bar: 3})).to.deep.equal({
      type: constants.OVERWRITE_METADATA_FIELD,
      field: 'foo',
      value: {bar: 3}
    });
  });
});

describe('setForwardCheckpoint', () => {
  it('creates a SET_FORWARD_CHECKPOINT', () => {
    expect(actions.setForwardCheckpoint(dummyCommutable)).to.deep.equal({
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: dummyCommutable,
    });
  });
});

describe('setBackwardCheckpoint', () => {
  it('creates a SET_BACKWARD_CHECKPOINT', () => {
    expect(actions.setBackwardCheckpoint(dummyCommutable, true)).to.deep.equal({
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: dummyCommutable,
      clearFutureStack: true,
    });
  });
});

describe('executeCell', () => {
  it.skip('creates an ERROR_KERNEL_NOT_CONNECTED action with channels not setup', (done) => {
    const channels = {
    };
    const id = '235';
    const source = 'print("hey")';

    actions.executeCell(channels, id, source, true, undefined)()
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.ERROR_KERNEL_NOT_CONNECTED,
          message: 'kernel not connected',
        })
        done();
      }, (action) => {
        expect.fail();
      }
    );
  });

  // Incomplete test setup, skipping yet providing boilerplate
  it.skip('echoes actions passed on from agendas.executeCell', (done) => {
    const channels = {
      iopub: new Rx.Subject(), // need to mock these
      shell: new Rx.Subject(), // or mock agendas.executeCell
    };
    const id = '235';
    const source = 'print("hey")';

    const subject = new Rx.Subject();

    subject
      .take(4)
      .subscribe((action) => {
        expect(action).to.deep.equal({});
        done();
      }, (action) => {
        expect.fail();
      }
    );

    actions.executeCell(channels, id, source, true, undefined)(subject);
  });
});

describe('splitCell', () => {
  it('creates a SPLIT_CELL action', () => {
    expect(actions.splitCell('235', 0)).to.deep.equal({
      type: constants.SPLIT_CELL,
      id: '235',
      position: 0,
    });
  });
});

describe('copyCell', () => {
  it('creates a COPY_CELL action', () => {
    expect(actions.copyCell('235')).to.deep.equal({
      type: constants.COPY_CELL,
      id: '235',
    });
  });
});

describe('changeOutputVisibility', () => {
  it('creates a CHANGE_OUTPUT_VISIBILITY action', () => {
    expect(actions.changeOutputVisibility('235')).to.deep.equal({
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id: '235',
    });
  });
});

describe('changeInputVisibility', () => {
  it('creates a CHANGE_INPUT_VISIBILITY action', () => {
    expect(actions.changeInputVisibility('235')).to.deep.equal({
      type: constants.CHANGE_INPUT_VISIBILITY,
      id: '235',
    });
  });
});

describe('pasteCell', () => {
  it('creates a PASTE_CELL action', () => {
    expect(actions.pasteCell()).to.deep.equal({
      type:constants.PASTE_CELL,
    });
  });
});

describe('changeCellType', () => {
  it('creates a CHANGE_CELL_TYPE action', () => {
    expect(actions.changeCellType('235', 'markdown')).to.deep.equal({
      type: constants.CHANGE_CELL_TYPE,
      id: '235',
      to: 'markdown',
    });
  });
});

describe('setModified', () => {
  it('creates a SET_MODIFIED action', () => {
    expect(actions.setModified(true)).to.deep.equal({
      type: constants.SET_MODIFIED,
      value: true,
    });
  });
});
