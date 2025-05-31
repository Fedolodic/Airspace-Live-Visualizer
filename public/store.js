export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  const getState = () => state;

  const setState = update => {
    state = { ...state, ...update };
    listeners.forEach(fn => fn(state));
  };

  const subscribe = fn => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  return { getState, setState, subscribe };
}

export const store = createStore({
  flights: [],
  usingSample: false,
  settings: {
    altitudeMin: 0,
    altitudeMax: 20000,
    pointSize: 0.03,
    live: true
  }
});
