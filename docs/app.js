import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js';
import { projects } from './projects.js';

const container = document.querySelector('#webgl');
const projectList = document.querySelector('#project-list');
const projectCount = document.querySelector('#project-count');
const fpsLabel = document.querySelector('#fps');
const modal = document.querySelector('#project-modal');
const modalClose = modal.querySelector('.modal-close');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

projectCount.textContent = String(projects.length).padStart(2, '0');

function openProject(project, index) {
  modal.hidden = false;
  modal.querySelector('.modal-index').textContent = `NODE ${String(index + 1).padStart(2, '0')} // ${project.year}`;
  modal.querySelector('.modal-eyebrow').textContent = project.eyebrow.toUpperCase();
  modal.querySelector('h2').textContent = project.title;
  modal.querySelector('.modal-description').textContent = project.description;
  modal.querySelector('.modal-stack').innerHTML = project.stack.map(item => `<span>${item}</span>`).join('');
  modal.querySelector('.modal-link').href = project.url;
}

modalClose.addEventListener('click', () => { modal.hidden = true; });
window.addEventListener('keydown', event => { if (event.key === 'Escape') modal.hidden = true; });

projects.forEach((project, index) => {
  const row = document.createElement('article');
  row.className = 'project-row';
  row.innerHTML = `
    <span class="num">${String(index + 1).padStart(2, '0')}</span>
    <div class="meta">
      <small>${project.eyebrow.toUpperCase()} · ${project.year}</small>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
    </div>
    <span class="arrow">↗</span>`;
  row.tabIndex = 0;
  row.addEventListener('click', () => openProject(project, index));
  row.addEventListener('keydown', e => { if (e.key === 'Enter') openProject(project, index); });
  projectList.appendChild(row);
});

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020711, 0.022);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 1.4, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const world = new THREE.Group();
scene.add(world);

const ambient = new THREE.AmbientLight(0x7fdfff, 0.8);
scene.add(ambient);
const key = new THREE.PointLight(0x62e8ff, 24, 45);
key.position.set(5, 8, 10);
scene.add(key);
const rim = new THREE.PointLight(0xb494ff, 18, 38);
rim.position.set(-10, -5, -2);
scene.add(rim);

const core = new THREE.Group();
const coreMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.2, 2),
  new THREE.MeshStandardMaterial({ color: 0x061421, emissive: 0x0a5260, emissiveIntensity: 1.3, metalness: 0.55, roughness: 0.28, wireframe: false })
);
const coreWire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.45, 1),
  new THREE.MeshBasicMaterial({ color: 0x62e8ff, wireframe: true, transparent: true, opacity: 0.22 })
);
core.add(coreMesh, coreWire);
world.add(core);

for (let r = 0; r < 3; r++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.7 + r * 1.6, 0.018, 8, 180),
    new THREE.MeshBasicMaterial({ color: r === 1 ? 0xb494ff : 0x62e8ff, transparent: true, opacity: 0.18 })
  );
  ring.rotation.set(Math.PI / 2 + r * 0.45, r * 0.6, r * 0.2);
  world.add(ring);
}

const starCount = innerWidth < 700 ? 900 : 1800;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const radius = 18 + Math.random() * 60;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * Math.cos(phi);
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xa8dfff, size: 0.045, transparent: true, opacity: 0.72 }));
scene.add(stars);

const nodeGroup = new THREE.Group();
world.add(nodeGroup);
const nodeMeshes = [];
const linePositions = [];

projects.forEach((project, index) => {
  const angle = (index / projects.length) * Math.PI * 2 + 0.5;
  const radius = 6.8 + (index % 2) * 1.7;
  const y = Math.sin(index * 1.7) * 2.2;
  const pos = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  const color = new THREE.Color(project.accent);

  const group = new THREE.Group();
  group.position.copy(pos);
  group.userData = { project, index };

  const shell = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.58, 1),
    new THREE.MeshStandardMaterial({ color: 0x07131f, emissive: color, emissiveIntensity: 0.55, metalness: 0.72, roughness: 0.24 })
  );
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.014, 8, 80),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
  );
  halo.rotation.x = Math.PI / 2;

  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.76, 18, 18),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.045, side: THREE.BackSide })
  );

  group.add(shell, halo, pulse);
  nodeGroup.add(group);
  nodeMeshes.push(shell);
  shell.userData = { project, index, group, halo, pulse };
  linePositions.push(0, 0, 0, pos.x, pos.y, pos.z);
});

const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x62e8ff, transparent: true, opacity: 0.12 }));
world.add(lines);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(10, 10);
let hovered = null;
let targetRotX = 0;
let targetRotY = 0;
let scrollProgress = 0;

function updatePointer(event) {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  targetRotY = (event.clientX / innerWidth - 0.5) * 0.26;
  targetRotX = (event.clientY / innerHeight - 0.5) * 0.16;
  cursorDot.style.left = `${event.clientX}px`;
  cursorDot.style.top = `${event.clientY}px`;
  cursorRing.style.left = `${event.clientX}px`;
  cursorRing.style.top = `${event.clientY}px`;
}
window.addEventListener('pointermove', updatePointer, { passive: true });

renderer.domElement.addEventListener('click', () => {
  if (!hovered) return;
  openProject(hovered.userData.project, hovered.userData.index);
});

window.addEventListener('scroll', () => {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollProgress = scrollY / max;
}, { passive: true });

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
}
window.addEventListener('resize', resize);

let frameCounter = 0;
let lastFpsTime = performance.now();
let displayedFps = 60;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  core.rotation.x = t * 0.12;
  core.rotation.y = t * 0.18;
  coreWire.rotation.y = -t * 0.11;
  stars.rotation.y = t * 0.006;

  world.rotation.y += (targetRotY - world.rotation.y) * 0.018;
  world.rotation.x += (targetRotX - world.rotation.x) * 0.018;
  world.position.z = THREE.MathUtils.lerp(0, -7, scrollProgress);
  camera.position.z = THREE.MathUtils.lerp(18, 14, scrollProgress);
  camera.position.y = THREE.MathUtils.lerp(1.4, -1.2, scrollProgress);
  camera.lookAt(0, 0, -scrollProgress * 2);

  nodeGroup.children.forEach((group, index) => {
    group.rotation.y = t * (0.3 + index * 0.025);
    group.rotation.x = t * 0.18;
    const breathe = 1 + Math.sin(t * 1.8 + index) * 0.05;
    group.scale.setScalar(breathe);
  });

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(nodeMeshes, false);
  const next = hits[0]?.object || null;
  if (hovered !== next) {
    if (hovered) {
      hovered.material.emissiveIntensity = 0.55;
      hovered.userData.halo.material.opacity = 0.5;
    }
    hovered = next;
    cursorRing.classList.toggle('active', Boolean(hovered));
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'default';
    if (hovered) {
      hovered.material.emissiveIntensity = 1.7;
      hovered.userData.halo.material.opacity = 1;
    }
  }

  renderer.render(scene, camera);

  frameCounter++;
  const now = performance.now();
  if (now - lastFpsTime > 750) {
    displayedFps = Math.round(frameCounter * 1000 / (now - lastFpsTime));
    fpsLabel.textContent = `${Math.min(displayedFps, 99)} FPS`;
    frameCounter = 0;
    lastFpsTime = now;
  }
}
animate();
