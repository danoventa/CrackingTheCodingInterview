import { expect } from 'chai';

import { executeCell, EXECUTE_CELL } from '../../../src/notebook/epics/execute';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../../utils';

describe('executeCell', () => {
  it('returns an executeCell action', () => {
    expect(executeCell('0-0-0-0', 'import random; random.random()'))
      .to.deep.equal({
        type: EXECUTE_CELL,
        id: '0-0-0-0',
        source: 'import random; random.random()',
      });
  });
});
