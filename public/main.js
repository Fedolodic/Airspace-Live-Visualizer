import { initGlobe, updateFlights, setPointSize, setAltitudeFilter, render } from './globe.js';
import { start, stop, onData } from './api.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

const DEV_MODE = location.hostname === 'localhost' || location.search.includes('dev');

let fpsDiv;
let updateDiv;
let fps = 0;
let frameCount = 0;
let lastFrame = performance.now();
let lastUpdate = 0;

if (DEV_MODE) {
  const stats = document.createElement('div');
  stats.id = 'stats';
  fpsDiv = document.createElement('div');
  updateDiv = document.createElement('div');
  stats.appendChild(fpsDiv);
  stats.appendChild(updateDiv);
  document.body.appendChild(stats);
}

const canvas = document.querySelector('canvas');
initGlobe(canvas);

const prevPositions = new Map();

onData(data => {
  const t0 = performance.now();
  updateFlights(data);
  lastUpdate = performance.now() - t0;
  if (DEV_MODE && updateDiv) {
    updateDiv.textContent = `update: ${lastUpdate.toFixed(1)} ms`;
  }
  for (const f of data) {
    const lon = f[5];
    const lat = f[6];
    const alt = f[7] ?? f[13] ?? 0;
    prevPositions.set(f[0], { lon, lat, alt });
  }
});

const params = {
  altitudeMin: 0,
  altitudeMax: 20000,
  pointSize: 0.03,
  live: true
};

const gui = new GUI();

gui.add(params, 'live').name('Live').onChange(val => {
  if (val) {
    start();
  } else {
    stop();
  }
});

gui.add(params, 'pointSize', 0.01, 1).name('Point Size').onChange(value => {
  setPointSize(value);
});

gui.add(params, 'altitudeMin', 0, 20000).name('Min Alt').onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
});

gui.add(params, 'altitudeMax', 0, 20000).name('Max Alt').onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
});

setAltitudeFilter(params.altitudeMin, params.altitudeMax);
setPointSize(params.pointSize);
start();

function renderLoop() {
  requestAnimationFrame(renderLoop);
  const now = performance.now();
  frameCount++;
  if (now - lastFrame >= 1000) {
    fps = (frameCount * 1000) / (now - lastFrame);
    frameCount = 0;
    lastFrame = now;
    if (DEV_MODE && fpsDiv) {
      fpsDiv.textContent = `fps: ${fps.toFixed(1)}`;
    }
  }
  render();
}

renderLoop();
