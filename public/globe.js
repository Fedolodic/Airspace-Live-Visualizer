// Engine selector for globe rendering
const useCesium = window.location.search.includes('cesium');

const engine = useCesium
  ? await import('./engines/globe-cesium.js')
  : await import('./engines/globe-three.js');

export const initGlobe = engine.initGlobe;
export const updateFlights = engine.updateFlights;
export const setPointSize = engine.setPointSize;
export const setAltitudeFilter = engine.setAltitudeFilter;
export const render = engine.render;
