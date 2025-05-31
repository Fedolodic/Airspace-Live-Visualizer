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

const params = {
  altitudeMin: 0,
  altitudeMax: 20000,
  pointSize: 0.03,
  live: true
};

const gui = new GUI();
gui.domElement.setAttribute('role', 'region');
gui.domElement.setAttribute('aria-label', 'Flight controls');
gui.domElement.tabIndex = 0;

const liveCtrl = gui.add(params, 'live').name('Live');
liveCtrl.domElement.querySelector('input').setAttribute('aria-label', 'Toggle live data');
liveCtrl.onChange(val => {
  if (val) {
    start();
  } else {
    stop();
  }
});

const sizeCtrl = gui.add(params, 'pointSize', 0.01, 1).name('Point Size');
sizeCtrl.domElement.querySelector('input').setAttribute('aria-label', 'Adjust point size');
sizeCtrl.onChange(value => {
  setPointSize(value);
});

const minCtrl = gui.add(params, 'altitudeMin', 0, 20000).name('Min Alt');
minCtrl.domElement.querySelector('input').setAttribute('aria-label', 'Minimum altitude filter');
minCtrl.onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
});

const maxCtrl = gui.add(params, 'altitudeMax', 0, 20000).name('Max Alt');
maxCtrl.domElement.querySelector('input').setAttribute('aria-label', 'Maximum altitude filter');
maxCtrl.onChange(() => {
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
