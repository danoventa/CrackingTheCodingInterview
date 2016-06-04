import { expect } from 'chai';

import { updateCellSource, executeCell } from '../../../src/notebook/actions';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../../utils';

describe('agendas.executeCell', () => {
  it('produces the right output', function() {
    this.timeout(2000);
    this.retries(3);
    return liveStore((kernel, dispatch, store) => {
      const cellId = store.getState().document.getIn(['notebook', 'cellOrder', 0]);
      const source = 'print("a")';
      dispatch(updateCellSource(cellId, source));

      return Promise.resolve()
        .then(() => dispatch(executeCell(kernel.channels, cellId, source, true, undefined)))
        .then(() => dispatchQueuePromise(dispatch))
        .then(() => waitForOutputs(store, cellId))
        .then(() => {
          const output = store.getState().document.getIn(['notebook', 'cellMap', cellId, 'outputs', 0]).toJS();
          expect(output.name).to.equal('stdout');
          expect(output.text).to.equal('a\n');
          expect(output.output_type).to.equal('stream');
        });
    });
  });
});
