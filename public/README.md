# Public Demo

This folder hosts the main demo for **Airspace Live Visualizer**.

## Contents
- `index.html` – entry page using ES modules
- `style.css` – base styles
- `main.js` – app bootstrap and loop
- `api.js` – flight data fetch
- `globe.js` – builds the Three.js scene
- `utils.js` – helpers
- `sample.json` – offline demo
- `assets/` – media files

## Prerequisites
Node.js (for `npx serve`) or Python 3 (for `python -m http.server`).

## Running
Serve this folder so `index.html` can load modules.

```bash
npx serve . -l 8000
# or
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

---
Author: David Martinez
Date: 2025-06-01
