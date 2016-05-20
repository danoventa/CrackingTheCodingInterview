import Immutable from 'immutable';
import * as constants from '../constants';

export default {
  [constants.SET_WIDGET_STATE]: function setWidgetState(documentState, action) {
    const { id, state } = action;
    return {
      ...documentState,
      widgetModels: documentState.widgetModels.update(
        id,
        new Immutable.Map(),
        oldWidgetState => oldWidgetState.merge(state)
      ),
    };
  },

  [constants.DELETE_WIDGET]: function deleteWidget(state, action) {
    return {
      ...state,
      widgetModels: state.widgetModels.delete(action.id),
    };
  },

  [constants.DISPLAY_WIDGET]: function displayWidget(state, action) {
    const { id, parentMsgId } = action;
    const cellId = state.notebook.getIn(['cellOrder', 0]); // TODO parentMsgId -> cellId
    return {
      ...state,
      widgetViews: state.widgetViews.update(
        cellId,
        new Immutable.List(),
        views => views.push(id)
      ),
    };
  },
};
