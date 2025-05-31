// Data fetching and polling utilities for OpenSky API
/** OpenSky REST endpoint returning current flight states. */
const API_URL = 'https://opensky-network.org/api/states/all';
/** Local fallback data when live fetching fails. */
const SAMPLE_URL = 'sample.json';

let callbacks = [];
let intervalId = null;
let pollInterval = 10000;
let usingSample = false;

/**
 * Register a callback to receive flight data.
 * @param {(data:Array, usingSample:boolean) => void} cb
 * @returns {void}
 */
export function onData(cb) {
  if (typeof cb === 'function') {
    callbacks.push(cb);
  }
}

/**
 * Invokes all registered callbacks with the latest flight data.
 *
 * @param {Array<Array>} data Parsed OpenSky `states` rows.
 * @returns {void}
 */
function notify(data) {
  for (const cb of callbacks) {
    try {
      cb(data, usingSample);
    } catch (e) {
      // ignore callback errors
    }
  }
}

/**
 * Fetches flight states from OpenSky and notifies listeners.
 * Falls back to `sample.json` on network errors.
 *
 * @returns {Promise<void>} Resolves after callbacks are executed.
 */
async function fetchData() {
  if (document.hidden) return;

  usingSample = false;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw res;
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter(s => s[5] != null && s[6] != null).slice(0, 5000);
    notify(filtered);
    return;
  } catch (err) {
    // fall back to sample data on failure
    console.error('OpenSky fetch failed, using sample', err);
  }

  try {
    usingSample = true;
    const res = await fetch(SAMPLE_URL);
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter(s => s[5] != null && s[6] != null);
    notify(filtered);
  } catch (err) {
    console.error('Failed to load sample data', err);
  }
}

/**
 * Starts periodic polling of flight data.
 *
 * @param {number} [interval=10000] Polling interval in milliseconds.
 * @returns {void}
 */
export function start(interval = 10000) {
  pollInterval = interval;
  stop();
  fetchData();
  intervalId = setInterval(fetchData, pollInterval);
}

/**
 * Halts the polling timer if active.
 *
 * @returns {void}
 */
export function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stop();
  } else if (!intervalId) {
    start(pollInterval);
  }
});
