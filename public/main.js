import { initGlobe, updateFlights, setPointSize, setAltitudeFilter, render } from './globe.js';
import { start, stop, onData } from './api.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

const canvas = document.querySelector('canvas');
initGlobe(canvas);

const prevPositions = new Map();

onData(data => {
  updateFlights(data);
  for (const f of data) {
    const lon = f[5];
    const lat = f[6];
    const alt = f[7] ?? f[13] ?? 0;
    prevPositions.set(f[0], { lon, lat, alt });
  }
});

const STORAGE_KEY = 'alvGuiParams';
const defaults = {
  altitudeMin: 0,
  altitudeMax: 20000,
  pointSize: 0.03,
  live: true
};

function loadParams() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      return { ...defaults, ...saved };
    }
  } catch (err) {
    console.error('Failed to parse saved GUI params', err);
  }
  return { ...defaults };
}

function saveParams() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch (_) {
    // ignore write errors
  }
}

const params = loadParams();

const gui = new GUI();

gui.add(params, 'live').name('Live').onChange(val => {
  if (val) {
    start();
  } else {
    stop();
  }
  saveParams();
});

gui.add(params, 'pointSize', 0.01, 1).name('Point Size').onChange(value => {
  setPointSize(value);
  saveParams();
});

gui.add(params, 'altitudeMin', 0, 20000).name('Min Alt').onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
  saveParams();
});

gui.add(params, 'altitudeMax', 0, 20000).name('Max Alt').onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
  saveParams();
});

setAltitudeFilter(params.altitudeMin, params.altitudeMax);
setPointSize(params.pointSize);

if (params.live) {
  start();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  render();
}

renderLoop();
