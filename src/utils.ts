import * as THREE from 'three';
import * as d3 from 'd3';
export const EARTH_RADIUS = 637;

export function latLonAltToVector3(lat: number, lon: number, alt = 0): any {
  const r = EARTH_RADIUS + alt / 10;
  const latRad = (THREE as any).MathUtils.degToRad(lat);
  const lonRad = (THREE as any).MathUtils.degToRad(lon);

  const x = r * Math.cos(latRad) * Math.cos(lonRad);
  const y = r * Math.sin(latRad);
  const z = r * Math.cos(latRad) * Math.sin(lonRad);

  return new (THREE as any).Vector3(x, y, z);
}

export interface GeoPoint {
  lat: number;
  lon: number;
  alt: number;
}

export function interpolateGreatCircle(a: GeoPoint, b: GeoPoint) {
  const interpLL = d3.geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
  return (t: number): GeoPoint => {
    const [lon, lat] = interpLL(t);
    const alt = a.alt + (b.alt - a.alt) * t;
    return { lat, lon, alt };
  };
}

export function lerpColor(c1: any, c2: any, t: number): any {
  const color1 = new (THREE as any).Color(c1 as any);
  const color2 = new (THREE as any).Color(c2 as any);
  return color1.lerp(color2, t);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
