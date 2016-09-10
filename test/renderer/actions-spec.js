import { expect } from 'chai';
import path from 'path';

import * as actions from '../../src/notebook/actions';

import * as constants from '../../src/notebook/constants';

import { dummyStore } from '../utils';

import {
  dummyJSON,
  dummyCommutable
} from './dummy-nb';

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

describe('newKernel', () => {
  it('creates a LAUNCH_KERNEL action', () => {
    expect(actions.newKernel('python2', '.')).to.deep.equal({
      type: constants.LAUNCH_KERNEL,
      kernelSpecName: 'python2',
      cwd: '.',
    })
  });
});

describe('setNotebook', () => {
  it('creates a SET_NOTEBOOK action', () => {
    expect(actions.setNotebook(dummyJSON, 'test/test-ipynb.ipynb')).to.deep.equal({
      type: constants.SET_NOTEBOOK,
      data: fromJS(dummyJSON),
      filename: 'test/test-ipynb.ipynb',
    });
  });
});

describe('setNotebookKernelInfo', () => {
  it('creates a SET_KERNEL_INFO action', () => {
    const kernelInfo = {name: 'japanese'};
    expect(actions.setNotebookKernelInfo(kernelInfo)).to.deep.equal({
      type: constants.SET_KERNEL_INFO,
      kernelInfo: {
        name: 'japanese',
      }
    })
  })
})

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

describe('cutCell', () => {
  it('creates a CUT_CELL action', () => {
    expect(actions.cutCell('235')).to.deep.equal({
      type: constants.CUT_CELL,
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
