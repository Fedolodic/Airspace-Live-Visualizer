# Airspace Live Visualizer

A real‑time, interactive **3‑D globe** that plots commercial flights fetched every few seconds from the **OpenSky Network** API.  Great‑circle arcs are extruded by altitude; an instanced plane icon moves along the head of each track.  Use the built‑in controls to pause, filter by altitude band, or resize markers.

---

## ✈️  Key Features

| Capability                      | Notes                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Live data**                   | Pulls [`/api/states/all`](https://opensky-network.org/apidoc/rest.html) every 10 s (rate‑limit safe) |
| **3‑D Globe**                   | `three.js` scene with a high‑res Earth texture + atmosphere shader                                   |
| **Great‑circle interpolation**  | `d3-geo` → smooth, geodesic splines between samples                                                  |
| **Altitude extrusion & colour** | Arc height ≈ `baro_altitude (m) / 10`; colour scale = `d3.scaleSequential(d3.interpolateViridis)`    |
| **Instanced billboards**        | `THREE.InstancedMesh` keeps GPU draw‑calls low (≤ 2 × flightCount)                                   |
| **Control panel**               | Altitude filter, play/pause, point‑size slider via `dat.GUI`                                         |
| **Offline demo**                | `sample.json` snapshot loads automatically if the API is unreachable                                 |

---

## 🛠️  Tech Stack

* **Vanilla ES modules** – no bundler required
* **three.js ^0.165** – rendering, ray‑casting for tooltips
* **D3 v7** – `geoInterpolate`, colour scales, utilities
* **dat.GUI** – lightweight UI tweak pane

> *👉 Feel free to swap in Vite/React/Deck.gl if you want hot‑reload or a component model; see Roadmap.*

---

## 📂 Project Structure

```
public/
 ├─ index.html        # mount point + importmap
 ├─ style.css         # basic layout, dark‑mode ready
 ├─ main.js           # app bootstrap & render loop
 ├─ api.js            # OpenSky fetch / cache / fallbacks
 ├─ globe.js          # scene graph & mesh builders
 ├─ utils.js          # helpers: greatCircle(), lerpColor(), etc.
 ├─ sample.json       # 1‑frame offline data blob
 └─ assets/
    └─ plane.svg     # simple vector icon
README.md
LICENSE
```

---

## 🚀 Quick Start

1. **Clone & serve the `public/` folder** (no build step)

   ```bash
   git clone https://github.com/<your‑user>/airspace-live-visualizer.git
   cd airspace-live-visualizer
   # optional: export OPENSKY_USERNAME=foo OPENSKY_PASSWORD=bar
   npx serve public -l 8000   # or: python -m http.server 8000 -d public
   ```

2. Open **[http://localhost:8000](http://localhost:8000)** in your browser → flights should animate within \~5 s.

---

## 🎮 Controls & Offline Mode

- Use the panel in the top‑right to toggle **Live** polling, adjust the
  **Min/Max Alt** filters, and change **Point Size**.
- If the OpenSky API cannot be reached the app automatically loads
  `sample.json` and shows an "Offline demo" banner.

---

## 🔧 Configuration

| Variable           | Needed?  | Purpose                                       |
| ------------------ | -------- | --------------------------------------------- |
| `OPENSKY_USERNAME` | Optional | Auth for higher rate limits (OpenSky account) |
| `OPENSKY_PASSWORD` | Optional | 〃                                             |
| `MAPBOX_TOKEN`     | Optional | If you swap globe → Mapbox basemap later |
| `SENTRY_DSN`       | Optional | Enable error reporting via Sentry         |
|
Set `OPENSKY_USERNAME` and `OPENSKY_PASSWORD` in your environment before
launching the static server if you have an OpenSky account. You can also
store them as **GitHub Secrets** to keep CI safe:
`Settings → Secrets → Actions → New repository secret`.

---

## 🧪 Development Workflow

```bash
corepack enable      # enables pnpm (Node 20 LTS)
pnpm install         # add eslint, prettier, jest as devDeps
pnpm run dev         # (optional) vite dev server if you migrate to a build
```

### Lint & Test (optional)

```bash
pnpm run lint        # eslint --ext .js ./public
pnpm run test        # jest
```

---

## 📈 Roadmap

* [ ] Swap static ES‑modules → **Vite** for faster HMR
* [ ] Tooltip overhaul with **Tippy.js**
* [ ] **CesiumJS** globe option for terrain & lighting
* [ ] Cache‐aware worker thread for data parsing
* [ ] Unit tests for utils (great‑circle, colour scale)
* [ ] Deploy to **GitHub Pages** via `gh-pages` action

Contributions & PRs welcome!  Please open an issue first to discuss major changes.

---

## 📜 License

[MIT](LICENSE) — © 2025 David Martinez.  Flight data © OpenSky Network under CC‑BY.

---

## 🙏 Acknowledgements

* **OpenSky Network** – real‑time ADS‑B data
* **NASA Visible Earth** – Blue Marble textures
* **three.js & D3 authors** – brilliant OSS foundations

---

> *Built for curiosity, utility, and truth.*
