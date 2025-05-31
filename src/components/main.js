import { initGlobe, render } from './globe.js';

const canvas = document.querySelector('canvas');
initGlobe(canvas);
function loop(){
  requestAnimationFrame(loop);
  render();
}
loop();
