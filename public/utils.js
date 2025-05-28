/*!
 * Utility helpers for geographic calculations and colour interpolation.
 */

// Assuming THREE and d3 are available globally via importmap or script tags.

/** Earth radius used for coordinate conversions (kilometres). */
export const EARTH_RADIUS = 637;

/**
 * Converts geographic coordinates into a THREE.Vector3.
 * Altitude is scaled down by a factor of 10 to match the globe scale.
 *
 * @param {number} lat Latitude in degrees.
 * @param {number} lon Longitude in degrees.
 * @param {number} [alt=0] Altitude in metres.
 * @returns {THREE.Vector3} Cartesian vector in scene units.
 */
export function latLonAltToVector3(lat, lon, alt = 0) {
  const r = EARTH_RADIUS + alt / 10;
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);

  const x = r * Math.cos(latRad) * Math.cos(lonRad);
  const y = r * Math.sin(latRad);
  const z = r * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates a great-circle interpolator between two geographic points.
 * Each point is an object containing `lat`, `lon` and `alt` (in metres).
 *
 * @param {{lat:number, lon:number, alt:number}} a Start point.
 * @param {{lat:number, lon:number, alt:number}} b End point.
 * @returns {(t:number) => {lat:number, lon:number, alt:number}} Function
 * returning an interpolated point for `t` in [0,1].
 */
export function interpolateGreatCircle(a, b) {
  const interpLL = d3.geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
  return t => {
    const [lon, lat] = interpLL(t);
    const alt = a.alt + (b.alt - a.alt) * t;
    return { lat, lon, alt };
  };
}

/**
 * Linearly interpolates between two colours.
 * Accepts any value recognised by `THREE.Color` (e.g. hex string or number).
 *
 * @param {THREE.Color | string | number} c1 Start colour.
 * @param {THREE.Color | string | number} c2 End colour.
 * @param {number} t Interpolation factor in [0,1].
 * @returns {THREE.Color} Resulting colour.
 */
export function lerpColor(c1, c2, t) {
  const color1 = new THREE.Color(c1);
  const color2 = new THREE.Color(c2);
  return color1.lerp(color2, t);
}

/**
 * Clamps a numeric value to the provided range.
 *
 * @param {number} value The input number.
 * @param {number} min Minimum allowed value.
 * @param {number} max Maximum allowed value.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

