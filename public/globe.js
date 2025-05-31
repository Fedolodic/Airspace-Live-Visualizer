import * as THREE from 'three';
import * as d3 from 'd3';
import { EARTH_RADIUS, latLonAltToVector3, interpolateGreatCircle } from './utils.js';
const EARTH_SEGMENTS = 64;
const ARC_SEGMENTS = 64;
const TUBE_RADIUS = 0.03;
const RADIAL_SEGMENTS = 8;
const PLANE_SIZE = 0.6;
let renderer;
let scene;
let camera;
let earth;
let arcGroup;
let planeMesh = null;
let tooltip;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let altitudeRange = [0, Infinity];
let pointSize = TUBE_RADIUS;
let flightInfos = [];
const prevPositions = new Map();
export function initGlobe(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, EARTH_RADIUS * 4);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const sphereGeo = new THREE.SphereGeometry(EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x224488, flatShading: true });
    earth = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(earth);
    arcGroup = new THREE.Group();
    scene.add(arcGroup);
    tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.padding = '2px 4px';
    tooltip.style.background = 'rgba(0,0,0,0.7)';
    tooltip.style.color = '#fff';
    tooltip.style.fontSize = '12px';
    tooltip.style.borderRadius = '2px';
    tooltip.style.display = 'none';
    canvas.parentElement?.appendChild(tooltip);
    canvas.addEventListener('pointermove', event => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        if (planeMesh) {
            const intersects = raycaster.intersectObject(planeMesh);
            if (intersects.length > 0) {
                const idx = intersects[0].instanceId;
                if (flightInfos[idx]) {
                    tooltip.textContent = flightInfos[idx].callsign || flightInfos[idx].icao24;
                    tooltip.style.left = `${event.clientX + 5}px`;
                    tooltip.style.top = `${event.clientY + 5}px`;
                    tooltip.style.display = 'block';
                }
            }
            else {
                tooltip.style.display = 'none';
            }
        }
    });
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}
export function setPointSize(size) {
    pointSize = size;
}
export function setAltitudeFilter(min, max) {
    altitudeRange[0] = min;
    altitudeRange[1] = max;
}
export function updateFlights(flights) {
    arcGroup.clear();
    if (planeMesh) {
        scene.remove(planeMesh);
        planeMesh.geometry.dispose();
        planeMesh.material.dispose();
        planeMesh = null;
    }
    flightInfos = [];
    const validFlights = [];
    for (const f of flights) {
        const lon = f[5];
        const lat = f[6];
        const alt = f[7] ?? f[13] ?? 0;
        if (lon == null || lat == null || alt == null)
            continue;
        if (alt < altitudeRange[0] || alt > altitudeRange[1])
            continue;
        validFlights.push({
            icao24: f[0],
            callsign: f[1] ? f[1].trim() : '',
            lon,
            lat,
            alt
        });
    }
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain(altitudeRange);
    const planeTexture = new THREE.TextureLoader().load('assets/plane.svg');
    const planeGeom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const planeMat = new THREE.MeshBasicMaterial({ map: planeTexture, transparent: true });
    planeMesh = new THREE.InstancedMesh(planeGeom, planeMat, validFlights.length);
    planeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(planeMesh);
    let i = 0;
    for (const info of validFlights) {
        const prev = prevPositions.get(info.icao24) ?? info;
        const interp = interpolateGreatCircle(prev, info);
        const pts = [];
        for (let s = 0; s <= ARC_SEGMENTS; s++) {
            const pos = interp(s / ARC_SEGMENTS);
            pts.push(latLonAltToVector3(pos.lat, pos.lon, pos.alt));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const geom = new THREE.TubeGeometry(curve, ARC_SEGMENTS, pointSize, RADIAL_SEGMENTS, false);
        const mat = new THREE.MeshBasicMaterial({ color: colorScale(info.alt) });
        const mesh = new THREE.Mesh(geom, mat);
        arcGroup.add(mesh);
        const endVec = pts[pts.length - 1];
        const dummy = new THREE.Object3D();
        dummy.position.copy(endVec);
        dummy.lookAt(camera.position);
        dummy.updateMatrix();
        planeMesh.setMatrixAt(i, dummy.matrix);
        flightInfos[i] = info;
        i += 1;
        prevPositions.set(info.icao24, info);
    }
    planeMesh.instanceMatrix.needsUpdate = true;
}
export function render() {
    if (planeMesh) {
        const dummy = new THREE.Object3D();
        for (let i = 0; i < flightInfos.length; i++) {
            planeMesh.getMatrixAt(i, dummy.matrix);
            dummy.lookAt(camera.position);
            dummy.updateMatrix();
            planeMesh.setMatrixAt(i, dummy.matrix);
        }
        planeMesh.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
}
