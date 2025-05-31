# Engine Modules

This folder hosts pluggable globe engines. `globe-three.js` implements
the original Three.js scene while `globe-cesium.js` offers a basic
CesiumJS version. Each module exposes `initGlobe`, `updateFlights`,
`setPointSize`, `setAltitudeFilter`, and `render`.

Open `demo.html` to try the Three.js engine, or append `?cesium` to the
URL to load the Cesium variant.

*Author: Codex*
*Date: 2025-06-01*

