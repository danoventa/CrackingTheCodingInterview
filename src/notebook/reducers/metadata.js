import { handleActions } from 'redux-actions';

import * as constants from '../constants';

function clearFuture(state) {
	return state.set('future', state.future.clear());
}

export default handleActions({
	[constants.CHANGE_FILENAME]: function changeFilename(state, action) {
		if (action.filename) {
			return state.set('filename', action.filename);
		}
		return state;
	},
	[constants.SET_FORWARD_CHECKPOINT]: function setForwardCheckpoint(state, action) {
		const { documentState } = action;
		return state.set('future', state.future.push(documentState));
	},
	[constants.SET_BACKWARD_CHECKPOINT]: function setBackwardCheckpoint(state, action) {
		const { documentState, clearFutureStack } = action;
		if (clearFutureStack) {
			return clearFuture(state.set('past', state.past.push(documentState)));
		}
		return state.set('past', state.past.push(documentState));
	},
	[constants.CLEAR_FUTURE]: clearFuture,
	[constants.UNDO]: function undo(state) {
		if (state.past.size === 0) {
			return state;
		}
		return state.set('past', state.past.pop());
	},
	[constants.REDO]: function redo(state) {
		if (state.future.size === 0) {
			return state;
		}
		return state.set('future', state.future.pop());
	},
}, {});
