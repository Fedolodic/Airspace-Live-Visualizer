// Data fetching and polling utilities for OpenSky API

const API_URL = 'https://opensky-network.org/api/states/all';
const SAMPLE_URL = 'sample.json';

let callbacks = [];
let intervalId = null;
let pollInterval = 10000;
const MIN_INTERVAL = 1000;
let usingSample = false;

function updateInterval(ms) {
  ms = Math.max(MIN_INTERVAL, ms);
  if (Math.abs(ms - pollInterval) > 50) {
    pollInterval = ms;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = setInterval(fetchData, pollInterval);
    }
  }
}

function adjustFromHeaders(res) {
  const retryAfter = parseInt(res.headers.get('Retry-After'));
  if (!Number.isNaN(retryAfter)) {
    updateInterval(retryAfter * 1000);
    return;
  }
  const remaining = parseInt(res.headers.get('X-Rate-Limit-Remaining'));
  const reset = parseInt(res.headers.get('X-Rate-Limit-Reset'));
  if (!Number.isNaN(remaining) && !Number.isNaN(reset)) {
    const now = Date.now() / 1000;
    const wait = (reset - now) / Math.max(remaining, 1) * 1000;
    if (wait > 0) updateInterval(wait);
  }
}

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
    adjustFromHeaders(res);
    if (!res.ok) throw res;
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter(s => s[5] != null && s[6] != null).slice(0, 5000);
    notify(filtered);
    return;
  } catch (err) {
    // fall back to sample data on failure
    if (err && err.headers) adjustFromHeaders(err);
    console.error('OpenSky fetch failed, using sample', err);
  }

  try {
    usingSample = true;
    const res = await fetch(SAMPLE_URL);
    adjustFromHeaders(res);
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter(s => s[5] != null && s[6] != null);
    notify(filtered);
  } catch (err) {
    console.error('Failed to load sample data', err);
  }
}

export function start(interval = 10000) {
  pollInterval = interval;
  stop();
  fetchData();
  intervalId = setInterval(fetchData, pollInterval);
}

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
