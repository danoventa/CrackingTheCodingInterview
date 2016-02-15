import * as Rx from '@reactivex/rxjs';

export default function createStore(initialState, reducers) {

  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => {
      if(!action || !action.type || ! (action.type in reducers)) {
        console.error('Action not registered');
        console.error(action);
        return state; // no reduction
      }

      return reducers[action.type].call(null, state, action);
    },
    initialState || {}
  ).publish().refCount();

  // Debugging time
  store.subscribe(null, (err) => {
    console.error('Error in the store', err);
  });

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
