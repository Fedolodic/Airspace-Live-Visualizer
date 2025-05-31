// CesiumJS globe scene management
import * as Cesium from 'https://cdn.jsdelivr.net/npm/cesium@1.113.1/Build/Cesium/Cesium.js';

let viewer;
let entities = [];
let altitudeRange = [0, Infinity];
let pointSize = 4;

export function initGlobe(container) {
  viewer = new Cesium.Viewer(container, {
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,
  });
}

export function setPointSize(size) {
  pointSize = size * 100; // rough scaling
}

export function setAltitudeFilter(min, max) {
  altitudeRange[0] = min;
  altitudeRange[1] = max;
}

export function updateFlights(flights) {
  for (const e of entities) {
    viewer.entities.remove(e);
  }
  entities = [];
  for (const f of flights) {
    const lon = f[5];
    const lat = f[6];
    const alt = f[7] ?? f[13] ?? 0;
    if (lon == null || lat == null || alt == null) continue;
    if (alt < altitudeRange[0] || alt > altitudeRange[1]) continue;
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
      point: { pixelSize: pointSize, color: Cesium.Color.YELLOW },
    });
    entities.push(entity);
  }
}

export function render() {
  viewer.render();
}
