import { initGlobe, updateFlights, setPointSize, setAltitudeFilter, render } from './globe.js';
import { start, stop, onData } from './api.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';
import { store } from './store.js';

const canvas = document.querySelector('canvas');
initGlobe(canvas);

onData((data, usingSample) => {
  store.setState({ flights: data, usingSample });
});

const params = { ...store.getState().settings };

const gui = new GUI();

gui.add(params, 'live').name('Live').onChange(val => {
  store.setState({ settings: { ...store.getState().settings, live: val } });
});

gui.add(params, 'pointSize', 0.01, 1).name('Point Size').onChange(value => {
  store.setState({ settings: { ...store.getState().settings, pointSize: value } });
});

gui.add(params, 'altitudeMin', 0, 20000).name('Min Alt').onChange(() => {
  store.setState({ settings: {
    ...store.getState().settings,
    altitudeMin: params.altitudeMin,
    altitudeMax: params.altitudeMax
  }});
});

gui.add(params, 'altitudeMax', 0, 20000).name('Max Alt').onChange(() => {
  store.setState({ settings: {
    ...store.getState().settings,
    altitudeMin: params.altitudeMin,
    altitudeMax: params.altitudeMax
  }});
});

setAltitudeFilter(params.altitudeMin, params.altitudeMax);
setPointSize(params.pointSize);
if (params.live) start();

let prevState = store.getState();
store.subscribe(state => {
  if (state.flights !== prevState.flights) {
    updateFlights(state.flights);
  }

  const prevSettings = prevState.settings;
  const settings = state.settings;

  if (settings.pointSize !== prevSettings.pointSize) {
    setPointSize(settings.pointSize);
  }

  if (
    settings.altitudeMin !== prevSettings.altitudeMin ||
    settings.altitudeMax !== prevSettings.altitudeMax
  ) {
    setAltitudeFilter(settings.altitudeMin, settings.altitudeMax);
  }

  if (settings.live !== prevSettings.live) {
    settings.live ? start() : stop();
  }

  const banner = document.getElementById('sample-banner');
  if (banner) {
    banner.classList.toggle('hidden', !state.usingSample);
  }

  prevState = state;
});

function renderLoop() {
  requestAnimationFrame(renderLoop);
  render();
}

renderLoop();
