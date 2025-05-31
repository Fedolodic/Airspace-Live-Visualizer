# Public Folder

This directory contains the static client for **Airspace Live Visualizer**.

## Contents
- `index.html` – entry page using vanilla ES modules.
- `style.css` – base styles.
- `main.js` – app bootstrap and loop.
- `api.js` – fetches flight data.
- `globe.js` – builds the Three.js scene.
- `utils.js` – common helpers.
- `sample.json` – offline demo data.
- `assets/` – images and other media.

## Running
Serve this folder with any static server so `index.html` can load modules.
Example:

```bash
npx serve . -l 8000
# or
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---
Author: David Martinez
Date: 2025-06-01
