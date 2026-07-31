import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ---------- renderer / scene / camera ----------

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.domElement.classList.add('space-canvas');
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00000a);
scene.fog = new THREE.FogExp2(0x02020c, 0.00035);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  4000
);
camera.rotation.order = 'YXZ';
camera.position.set(0, 0, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- lights ----------

scene.add(new THREE.AmbientLight(0x445577, 1.1));
const sunLight = new THREE.PointLight(0xfff2d6, 1.8, 0, 0);
sunLight.position.set(400, 250, -900);
scene.add(sunLight);

// ---------- starfield (infinite box-wrap) ----------

const STAR_COUNT = 5000;
const STAR_BOUNDS = 1600; // half-size of the wrap volume, centered on the camera

const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);

const starPalette = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xbfd4ff),
  new THREE.Color(0xffe3c2),
  new THREE.Color(0xd6c2ff),
];

for (let i = 0; i < STAR_COUNT; i++) {
  const ix = i * 3;
  starPositions[ix] = (Math.random() * 2 - 1) * STAR_BOUNDS;
  starPositions[ix + 1] = (Math.random() * 2 - 1) * STAR_BOUNDS;
  starPositions[ix + 2] = (Math.random() * 2 - 1) * STAR_BOUNDS;

  const c = starPalette[Math.floor(Math.random() * starPalette.length)];
  starColors[ix] = c.r;
  starColors[ix + 1] = c.g;
  starColors[ix + 2] = c.b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 2.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: true,
  depthWrite: false,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

function wrapStars() {
  const pos = starGeometry.attributes.position.array;
  const cx = camera.position.x;
  const cy = camera.position.y;
  const cz = camera.position.z;

  for (let i = 0; i < STAR_COUNT; i++) {
    const ix = i * 3;

    let dx = pos[ix] - cx;
    if (dx > STAR_BOUNDS) pos[ix] -= STAR_BOUNDS * 2;
    else if (dx < -STAR_BOUNDS) pos[ix] += STAR_BOUNDS * 2;

    let dy = pos[ix + 1] - cy;
    if (dy > STAR_BOUNDS) pos[ix + 1] -= STAR_BOUNDS * 2;
    else if (dy < -STAR_BOUNDS) pos[ix + 1] += STAR_BOUNDS * 2;

    let dz = pos[ix + 2] - cz;
    if (dz > STAR_BOUNDS) pos[ix + 2] -= STAR_BOUNDS * 2;
    else if (dz < -STAR_BOUNDS) pos[ix + 2] += STAR_BOUNDS * 2;
  }

  starGeometry.attributes.position.needsUpdate = true;
}

// ---------- nebula clouds (soft glowing sprites) ----------

function makeGlowTexture(hex) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `${hex}ff`);
  gradient.addColorStop(0.4, `${hex}88`);
  gradient.addColorStop(1, `${hex}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const nebulaColors = ['#5b2bd6', '#1f6fd6', '#d63bb0'];
const nebulaGroup = new THREE.Group();

for (let i = 0; i < 9; i++) {
  const color = nebulaColors[i % nebulaColors.length];
  const material = new THREE.SpriteMaterial({
    map: makeGlowTexture(color),
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = 500 + Math.random() * 700;
  sprite.scale.set(scale, scale, 1);
  sprite.position.set(
    (Math.random() * 2 - 1) * 1400,
    (Math.random() * 2 - 1) * 800,
    -600 - Math.random() * 3000
  );
  nebulaGroup.add(sprite);
}
scene.add(nebulaGroup);

// ---------- planets (decorative waypoints along the flight path) ----------

const planetConfigs = [
  { radius: 60, color: 0xd98c4a, z: -700, x: -250, y: 60, ring: false },
  { radius: 40, color: 0x6ea8d6, z: -1500, x: 320, y: -80, ring: false },
  { radius: 90, color: 0xc9b28a, z: -2400, x: -180, y: 140, ring: true },
  { radius: 30, color: 0xaa6fd6, z: -3200, x: 200, y: -40, ring: false },
];

const planets = [];

planetConfigs.forEach((cfg) => {
  const geometry = new THREE.SphereGeometry(cfg.radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: 0.28,
    roughness: 0.75,
    metalness: 0.1,
  });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(cfg.x, cfg.y, cfg.z);
  scene.add(planet);
  planets.push(planet);

  if (cfg.ring) {
    const ringGeo = new THREE.RingGeometry(cfg.radius * 1.4, cfg.radius * 2.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe0d3b0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    ring.position.copy(planet.position);
    scene.add(ring);
  }
});

// distant glowing "sun"
const sunSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: makeGlowTexture('#fff2c2'),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
sunSprite.scale.set(900, 900, 1);
sunSprite.position.set(400, 250, -900);
scene.add(sunSprite);

// ---------- mouse-look (bounded, damped) ----------

let targetYaw = 0;
let targetPitch = 0;
let currentYaw = 0;
let currentPitch = 0;

const MAX_YAW = 0.9;
const MAX_PITCH = 0.55;

window.addEventListener('mousemove', (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  targetYaw = -nx * MAX_YAW;
  targetPitch = -ny * MAX_PITCH;
});

// touch: drag to look
let touchStartX = null;
let touchStartY = null;

window.addEventListener('touchstart', (e) => {
  if (e.touches.length) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!e.touches.length || touchStartX === null) return;
  const dx = (e.touches[0].clientX - touchStartX) / window.innerWidth;
  const dy = (e.touches[0].clientY - touchStartY) / window.innerHeight;
  targetYaw = -dx * MAX_YAW * 2;
  targetPitch = -dy * MAX_PITCH * 2;
}, { passive: true });

// ---------- scroll-to-fly ----------

let flySpeed = 0;
const MAX_SPEED = 3.2;
const FRICTION = 0.945;
const WHEEL_SCALE = 0.0026;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  flySpeed += e.deltaY * WHEEL_SCALE;
  flySpeed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, flySpeed));
  hideHint();
}, { passive: false });

// touch: vertical swipe to fly
let lastTouchY = null;
window.addEventListener('touchmove', (e) => {
  if (!e.touches.length) return;
  const y = e.touches[0].clientY;
  if (lastTouchY !== null) {
    flySpeed += (lastTouchY - y) * 0.02;
    flySpeed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, flySpeed));
  }
  lastTouchY = y;
  hideHint();
}, { passive: true });

window.addEventListener('touchend', () => {
  touchStartX = null;
  touchStartY = null;
  lastTouchY = null;
});

// ---------- hint fade ----------

const hintEl = document.getElementById('space-hint');
let hintHidden = false;
function hideHint() {
  if (hintHidden || !hintEl) return;
  hintHidden = true;
  hintEl.classList.add('space-hint--hidden');
}
window.addEventListener('mousemove', hideHint, { once: true });
setTimeout(hideHint, 6000);

// ---------- animation loop ----------

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  currentYaw += (targetYaw - currentYaw) * 0.06;
  currentPitch += (targetPitch - currentPitch) * 0.06;
  camera.rotation.y = currentYaw;
  camera.rotation.x = currentPitch;

  flySpeed *= FRICTION;
  camera.translateZ(-flySpeed);

  wrapStars();

  nebulaGroup.children.forEach((sprite, i) => {
    sprite.material.rotation += dt * 0.02 * (i % 2 === 0 ? 1 : -1);
  });

  planets.forEach((p) => {
    p.rotation.y += dt * 0.05;
  });

  renderer.render(scene, camera);
}

animate();
