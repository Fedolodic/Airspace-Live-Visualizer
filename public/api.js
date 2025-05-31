// Data fetching and polling utilities for OpenSky API
import { log, error as logError } from './logger.js';

const API_URL = 'https://opensky-network.org/api/states/all';
const SAMPLE_URL = 'sample.json';

let callbacks = [];
let intervalId = null;
let pollInterval = 10000;
let usingSample = false;

/**
 * Register a callback to receive flight data.
 * @param {(data:Array, usingSample:boolean) => void} cb
 */
export function onData(cb) {
  if (typeof cb === 'function') {
    callbacks.push(cb);
  }
}

function notify(data) {
  for (const cb of callbacks) {
    try {
      cb(data, usingSample);
    } catch (e) {
      // ignore callback errors
    }
  }
}

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
    log('Fetched live flight data');
    return;
  } catch (err) {
    // fall back to sample data on failure
    logError(err, { msg: 'OpenSky fetch failed, using sample' });
  }

  try {
    usingSample = true;
    const res = await fetch(SAMPLE_URL);
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter(s => s[5] != null && s[6] != null);
    notify(filtered);
    log('Loaded sample flight data');
  } catch (err) {
    logError(err, { msg: 'Failed to load sample data' });
  }
}

export function start(interval = 10000) {
  pollInterval = interval;
  stop();
  fetchData();
  intervalId = setInterval(fetchData, pollInterval);
  log('Polling started');
}

export function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    log('Polling stopped');
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stop();
  } else if (!intervalId) {
    start(pollInterval);
  }
});
