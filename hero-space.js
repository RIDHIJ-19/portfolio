import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('hero-canvas');
const header = document.querySelector('.header');

if (canvas && header) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- renderer / scene / camera ----------

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 4000);
  camera.position.set(0, 0, 0);

  function sizeToHeader() {
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight, header.offsetHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  sizeToHeader();
  window.addEventListener('resize', sizeToHeader);

  // ---------- starfield ----------

  const STAR_COUNT = 3200;
  const STAR_BOUNDS = 1400;

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starColors = new Float32Array(STAR_COUNT * 3);

  const starPalette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xffd6e6),
    new THREE.Color(0xff9dc0),
    new THREE.Color(0xe6c2ff),
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

  function makeStarTexture() {
    const size = 32;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const starMaterial = new THREE.PointsMaterial({
    size: 2.6,
    map: makeStarTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ---------- mouse-driven look (left / right only) ----------
  // Vertical mouse movement and the page's normal scroll are both left
  // alone; only horizontal mouse position steers the view.

  let targetYaw = 0;
  let currentYaw = 0;
  const MAX_YAW = 0.5;

  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    targetYaw = -nx * MAX_YAW;
  });

  // ---------- photo layer: moves with the same look + scroll, so the ----------
  // ---------- photo, stars and constellation read as one scene ----------

  const heroPhoto = document.querySelector('.hero-photo');
  let currentPhotoScale = 1.08;

  function updateHeroPhoto() {
    if (!heroPhoto) return;
    const scrollT = Math.max(0, Math.min(1, window.scrollY / (header.offsetHeight || 1)));
    const targetScale = 1.08 + scrollT * 0.16;
    currentPhotoScale += (targetScale - currentPhotoScale) * 0.08;
    const shiftX = -currentYaw * 220;
    heroPhoto.style.transform = `translateX(${shiftX.toFixed(1)}px) scale(${currentPhotoScale.toFixed(3)})`;
  }

  // ---------- pause rendering when the hero is scrolled out of view ----------

  let heroVisible = true;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(header);
  }

  // ---------- animation loop ----------

  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (!heroVisible) return;

    currentYaw += (targetYaw - currentYaw) * 0.06;
    camera.rotation.y = currentYaw;
    updateHeroPhoto();

    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else animate();
  });

  if (!prefersReducedMotion) {
    animate();
  } else {
    renderer.render(scene, camera);
  }
}
