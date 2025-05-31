// Data fetching and polling utilities for OpenSky API

const API_URL = 'https://opensky-network.org/api/states/all';
const SAMPLE_URL = 'sample.json';

let callbacks = [];
let timeoutId = null;
let baseInterval = 10000;
let currentInterval = baseInterval;
const MAX_INTERVAL = 60000;
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
    currentInterval = baseInterval;
    scheduleNext();
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
    currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL);
  } catch (err) {
    console.error('Failed to load sample data', err);
  }
  scheduleNext();
}

function scheduleNext() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(fetchData, currentInterval);
}

export function start(interval = 10000) {
  baseInterval = interval;
  currentInterval = baseInterval;
  stop();
  fetchData();
}

export function stop() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stop();
  } else if (!timeoutId) {
    start(baseInterval);
  }
});
