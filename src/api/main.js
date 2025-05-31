import { start, stop, onData } from './api.js';

onData((data) => {
  console.log('Received flights', data.length);
  stop();
});

start();
