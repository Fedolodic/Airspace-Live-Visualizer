import { initGlobe, updateFlights, setPointSize, setAltitudeFilter, render } from './globe.js';
import { start, stop, onData } from './api.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';
import { loadLocale, t } from './i18n.js';

const canvas = document.querySelector('canvas');
await loadLocale();
document.title = t('title');
const banner = document.getElementById('sample-banner');
banner.textContent = t('offlineBanner');
initGlobe(canvas);

const prevPositions = new Map();

onData((data, sample) => {
  updateFlights(data);
  if (sample) banner.classList.remove('hidden');
  else banner.classList.add('hidden');
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

gui.add(params, 'live').name(t('live')).onChange(val => {
  if (val) {
    start();
  } else {
    stop();
  }
});

gui.add(params, 'pointSize', 0.01, 1).name(t('pointSize')).onChange(value => {
  setPointSize(value);
});

gui.add(params, 'altitudeMin', 0, 20000).name(t('minAlt')).onChange(() => {
  setAltitudeFilter(params.altitudeMin, params.altitudeMax);
});

gui.add(params, 'altitudeMax', 0, 20000).name(t('maxAlt')).onChange(() => {
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
