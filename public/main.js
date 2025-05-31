import { initGlobe, updateFlights, setPointSize, setAltitudeFilter, render } from './globe.js';
import { start, stop, onData } from './api.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

const canvas = document.querySelector('canvas');
const sampleBanner = document.getElementById('sample-banner');
initGlobe(canvas);

const prevPositions = new Map();

onData((data, fromSample) => {
  updateFlights(data);
  if (fromSample) {
    sampleBanner.classList.remove('hidden');
  } else {
    sampleBanner.classList.add('hidden');
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
  render();
}

renderLoop();
