import { clamp } from '../public/utils.js';

document.body.insertAdjacentHTML('beforeend', `<p>Clamp demo: ${clamp(5, 0, 3)}</p>`);
