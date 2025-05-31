// Data fetching and polling utilities for OpenSky API

const API_URL = 'https://opensky-network.org/api/states/all';
const SAMPLE_URL = 'sample.json';

let callbacks = [];
let intervalId = null;
let pollInterval = 10000;
let usingSample = false;

// load default interval from env then override with stored preference
if (typeof process !== 'undefined' && process.env && process.env.POLL_INTERVAL) {
  const envInt = parseInt(process.env.POLL_INTERVAL, 10);
  if (!isNaN(envInt)) pollInterval = envInt;
}

if (typeof localStorage !== 'undefined') {
  const storedInt = parseInt(localStorage.getItem('pollInterval'), 10);
  if (!isNaN(storedInt)) pollInterval = storedInt;
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

export function start(interval = pollInterval) {
  pollInterval = interval;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('pollInterval', String(pollInterval));
    } catch (e) {
      /* ignore quota errors */
    }
  }
  stop();
  fetchData();
  intervalId = setInterval(fetchData, pollInterval);
}

export function setPollInterval(interval) {
  const intVal = parseInt(interval, 10);
  if (!isNaN(intVal) && intVal > 0) {
    start(intVal);
  }
}

export function getPollInterval() {
  return pollInterval;
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
