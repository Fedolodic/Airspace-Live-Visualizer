import { latLonAltToVector3, clamp } from './utils.js';

console.log('Vector:', latLonAltToVector3(0,0,0));
console.log('Clamp 5 ->', clamp(5,1,3));
