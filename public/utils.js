import * as THREE from 'three';
import * as d3 from 'd3';
export const EARTH_RADIUS = 637;
export function latLonAltToVector3(lat, lon, alt = 0) {
    const r = EARTH_RADIUS + alt / 10;
    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(lon);
    const x = r * Math.cos(latRad) * Math.cos(lonRad);
    const y = r * Math.sin(latRad);
    const z = r * Math.cos(latRad) * Math.sin(lonRad);
    return new THREE.Vector3(x, y, z);
}
export function interpolateGreatCircle(a, b) {
    const interpLL = d3.geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
    return (t) => {
        const [lon, lat] = interpLL(t);
        const alt = a.alt + (b.alt - a.alt) * t;
        return { lat, lon, alt };
    };
}
export function lerpColor(c1, c2, t) {
    const color1 = new THREE.Color(c1);
    const color2 = new THREE.Color(c2);
    return color1.lerp(color2, t);
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
