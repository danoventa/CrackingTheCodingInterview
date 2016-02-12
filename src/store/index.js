import * as Rx from '@reactivex/rxjs';

export default function createStore(initialState, reducers) {

  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => reducers[action.type].call(null, state, action),
    initialState || {}
  );

  const channelStream = subject.filter(action => action.channels)
                               .pluck('channels');
  // wrap channels in a closure, track the latest
  let channels = {};
  channelStream.subscribe(ch => {
    channels = ch;
  });

  function dispatch(action) {
    // We need the current state at this time
    return typeof action === 'function'
      ? action.call(null, subject, dispatch, channels)
      : subject.next(action);
  }

  return {
    store,
    dispatch,
  };

}
