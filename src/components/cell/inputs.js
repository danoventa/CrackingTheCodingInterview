import React, { PropTypes } from 'react';

export default function Inputs({ executionCount }) {
  return (
    <div className="cell_inputs">
      [{ ! executionCount ? ' ' : executionCount }]
    </div>
  );
}

Inputs.propTypes = {
  executionCount: PropTypes.any,
};
