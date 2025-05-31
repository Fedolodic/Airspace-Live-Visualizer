const API_URL = 'https://opensky-network.org/api/states/all';
const SAMPLE_URL = 'sample.json';

type Callback = (data: any[], usingSample: boolean) => void;

let callbacks: Callback[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let pollInterval = 10000;
let usingSample = false;

export function onData(cb: Callback): void {
  if (typeof cb === 'function') {
    callbacks.push(cb);
  }
}

function notify(data: any[]): void {
  for (const cb of callbacks) {
    try {
      cb(data, usingSample);
    } catch {
      // ignore errors from callbacks
    }
  }
}

async function fetchData(): Promise<void> {
  if (document.hidden) return;

  usingSample = false;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw res;
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter((s: any[]) => s[5] != null && s[6] != null).slice(0, 5000);
    notify(filtered);
    return;
  } catch (err) {
    console.error('OpenSky fetch failed, using sample', err);
  }

  try {
    usingSample = true;
    const res = await fetch(SAMPLE_URL);
    const json = await res.json();
    const states = Array.isArray(json.states) ? json.states : [];
    const filtered = states.filter((s: any[]) => s[5] != null && s[6] != null);
    notify(filtered);
  } catch (err) {
    console.error('Failed to load sample data', err);
  }
}

export function start(interval: number = 10000): void {
  pollInterval = interval;
  stop();
  fetchData();
  intervalId = setInterval(fetchData, pollInterval);
}

export function stop(): void {
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
