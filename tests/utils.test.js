import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal THREE and d3 mocks for utils.js
global.THREE = {
  MathUtils: {
    degToRad: deg => deg * Math.PI / 180
  },
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  },
  Color: class {
    constructor(value) {
      if (typeof value === 'string' && value.startsWith('#')) {
        this.r = parseInt(value.slice(1, 3), 16) / 255;
        this.g = parseInt(value.slice(3, 5), 16) / 255;
        this.b = parseInt(value.slice(5, 7), 16) / 255;
      } else if (typeof value === 'number') {
        this.r = ((value >> 16) & 255) / 255;
        this.g = ((value >> 8) & 255) / 255;
        this.b = (value & 255) / 255;
      } else if (value && typeof value === 'object') {
        this.r = value.r; this.g = value.g; this.b = value.b;
      } else {
        this.r = this.g = this.b = 0;
      }
    }
    lerp(color, t) {
      this.r += (color.r - this.r) * t;
      this.g += (color.g - this.g) * t;
      this.b += (color.b - this.b) * t;
      return this;
    }
  }
};

global.d3 = {
  geoInterpolate: ([lon1, lat1], [lon2, lat2]) => t => [
    lon1 + (lon2 - lon1) * t,
    lat1 + (lat2 - lat1) * t
  ]
};

import {
  EARTH_RADIUS,
  latLonAltToVector3,
  interpolateGreatCircle,
  lerpColor,
  clamp
} from '../public/utils.js';

test('latLonAltToVector3 converts coordinates to Vector3', () => {
  const v = latLonAltToVector3(0, 0, 0);
  assert.equal(v.x, EARTH_RADIUS);
  assert.equal(v.y, 0);
  assert.equal(v.z, 0);
});

test('interpolateGreatCircle interpolates lat/lon/alt', () => {
  const interp = interpolateGreatCircle(
    { lat: 0, lon: 0, alt: 0 },
    { lat: 0, lon: 90, alt: 100 }
  );
  const p = interp(0.5);
  assert.equal(p.lat, 0);
  assert.equal(p.lon, 45);
  assert.equal(p.alt, 50);
});

test('lerpColor linearly interpolates colours', () => {
  const c = lerpColor('#000000', '#ffffff', 0.5);
  assert.ok(Math.abs(c.r - 0.5) < 1e-6);
  assert.ok(Math.abs(c.g - 0.5) < 1e-6);
  assert.ok(Math.abs(c.b - 0.5) < 1e-6);
});

test('clamp constrains numeric range', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(20, 0, 10), 10);
});
