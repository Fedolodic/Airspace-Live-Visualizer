import * as THREE from 'three';
import { latLonAltToVector3, interpolateGreatCircle } from './utils.js';

const ARC_SEGMENTS = 64;

// store previous positions for smooth paths
const prevPositions = new Map();

self.onmessage = (e) => {
  const { type, flights, altitudeRange } = e.data;
  if (type !== 'calc') return;

  const validFlights = [];
  const paths = [];
  for (const f of flights) {
    const lon = f[5];
    const lat = f[6];
    const alt = f[7] ?? f[13] ?? 0;
    if (lon == null || lat == null || alt == null) continue;
    if (alt < altitudeRange[0] || alt > altitudeRange[1]) continue;

    const info = {
      icao24: f[0],
      callsign: f[1] ? f[1].trim() : '',
      lon,
      lat,
      alt
    };
    validFlights.push(info);

    const prev = prevPositions.get(info.icao24) ?? info;
    const interp = interpolateGreatCircle(prev, info);
    const positions = new Float32Array((ARC_SEGMENTS + 1) * 3);
    for (let s = 0; s <= ARC_SEGMENTS; s++) {
      const pos = interp(s / ARC_SEGMENTS);
      const vec = latLonAltToVector3(pos.lat, pos.lon, pos.alt);
      positions[s * 3] = vec.x;
      positions[s * 3 + 1] = vec.y;
      positions[s * 3 + 2] = vec.z;
    }
    paths.push(positions);

    prevPositions.set(info.icao24, info);
  }

  self.postMessage({ flights: validFlights, paths });
};
