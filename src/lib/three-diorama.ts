import * as THREE from "three";

export interface DioramaOptions {
  container: HTMLDivElement;
  activeIncidentsCount?: number;
}

export function initThreeDiorama({ container, activeIncidentsCount = 0 }: DioramaOptions) {
  const width = container.clientWidth || 550;
  const height = container.clientHeight || 450;

  // 1. Scene & Camera Setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(13, 11, 15);
  camera.lookAt(0, 1.2, 0);

  // 2. WebGL Renderer with High-Quality Shadows
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 3. Pixar Golden-Hour Lighting
  // Hemisphere Twilight Sky light
  const hemiLight = new THREE.HemisphereLight(0x4a2e80, 0xf97316, 1.2);
  scene.add(hemiLight);

  // Warm Golden Sunlight (sunset angle)
  const sunLight = new THREE.DirectionalLight(0xffb703, 2.2);
  sunLight.position.set(16, 20, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Fill Light from twilight horizon
  const fillLight = new THREE.DirectionalLight(0x9d4edd, 0.6);
  fillLight.position.set(-14, 8, -12);
  scene.add(fillLight);

  // Root Diorama Group
  const dioramaGroup = new THREE.Group();
  scene.add(dioramaGroup);

  // 4. Stylized Floating Sanctuary Base
  // Top Meadow
  const topGeo = new THREE.CylinderGeometry(8, 8.4, 1.2, 24);
  const topMat = new THREE.MeshLambertMaterial({ color: 0x80b918 });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 0;
  topMesh.receiveShadow = true;
  dioramaGroup.add(topMesh);

  // Cobblestone Pathway across meadow
  const pathGeo = new THREE.RingGeometry(1.5, 4.2, 16, 1, 0, Math.PI * 0.9);
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xe29578, side: THREE.DoubleSide });
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.rotation.x = -Math.PI / 2;
  pathMesh.position.set(-0.5, 0.61, 0.5);
  pathMesh.receiveShadow = true;
  dioramaGroup.add(pathMesh);

  // Earth Cliff layers
  const earthGeo = new THREE.CylinderGeometry(8.4, 3.8, 5, 12);
  const earthMat = new THREE.MeshLambertMaterial({ color: 0x99582a });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthMesh.position.y = -3;
  dioramaGroup.add(earthMesh);

  // Pond with crystal reflections
  const pondGeo = new THREE.CircleGeometry(2.4, 20);
  const pondMat = new THREE.MeshBasicMaterial({ color: 0x48cae4 });
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.rotation.x = -Math.PI / 2;
  pondMesh.position.set(3, 0.62, 2);
  dioramaGroup.add(pondMesh);

  // 5. Stylized Ivy-Covered Brick Archway
  const archGroup = new THREE.Group();
  const pillarGeo = new THREE.BoxGeometry(0.7, 3.6, 0.7);
  const archMat = new THREE.MeshLambertMaterial({ color: 0xb56576 });

  const leftPillar = new THREE.Mesh(pillarGeo, archMat);
  leftPillar.position.set(-1.8, 1.8, -3.5);
  leftPillar.castShadow = true;
  archGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, archMat);
  rightPillar.position.set(1.8, 1.8, -3.5);
  rightPillar.castShadow = true;
  archGroup.add(rightPillar);

  const beamGeo = new THREE.BoxGeometry(4.4, 0.6, 0.8);
  const beam = new THREE.Mesh(beamGeo, archMat);
  beam.position.set(0, 3.6, -3.5);
  beam.castShadow = true;
  archGroup.add(beam);

  // Archway Ivy Foliage
  const ivyGeo = new THREE.DodecahedronGeometry(0.5);
  const ivyMat = new THREE.MeshLambertMaterial({ color: 0x55a630 });
  for (let i = 0; i < 6; i++) {
    const ivy = new THREE.Mesh(ivyGeo, ivyMat);
    ivy.position.set(-1.8 + i * 0.7, 3.8, -3.4 + (i % 2) * 0.2);
    archGroup.add(ivy);
  }
  dioramaGroup.add(archGroup);

  // 6. Glowing Streetlamp
  const lampGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(4, 1.6, -1.5);
  pole.castShadow = true;
  lampGroup.add(pole);

  // Lantern Head
  const lanternGeo = new THREE.BoxGeometry(0.7, 0.8, 0.7);
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(4, 3.2, -1.5);
  lampGroup.add(lantern);

  // Warm Amber Streetlamp Glow Light
  const lampLight = new THREE.PointLight(0xffb703, 1.8, 8);
  lampLight.position.set(4, 3.3, -1.5);
  lampGroup.add(lampLight);
  dioramaGroup.add(lampGroup);

  // 7. Expressive Pixar Animal Companions
  // A. Scruffy Golden Puppy with soulful head tracking & tail wag
  const puppyGroup = new THREE.Group();

  // Puppy Body
  const puppyBodyGeo = new THREE.BoxGeometry(1.3, 0.9, 0.8);
  const puppyMat = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
  const puppyBody = new THREE.Mesh(puppyBodyGeo, puppyMat);
  puppyBody.position.y = 0.7;
  puppyBody.castShadow = true;
  puppyGroup.add(puppyBody);

  // Puppy Head Pivot Group
  const puppyHeadPivot = new THREE.Group();
  puppyHeadPivot.position.set(0.7, 1.2, 0);

  const puppyHeadGeo = new THREE.BoxGeometry(0.85, 0.8, 0.75);
  const puppyHead = new THREE.Mesh(puppyHeadGeo, puppyMat);
  puppyHead.castShadow = true;
  puppyHeadPivot.add(puppyHead);

  // Floppy Ears
  const earGeo = new THREE.BoxGeometry(0.25, 0.6, 0.3);
  const earMat = new THREE.MeshLambertMaterial({ color: 0xe76f51 });
  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.position.set(0.1, 0.15, 0.45);
  puppyHeadPivot.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, earMat);
  rightEar.position.set(0.1, 0.15, -0.45);
  puppyHeadPivot.add(rightEar);

  // Snout & Nose
  const snoutGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45);
  const snoutMat = new THREE.MeshLambertMaterial({ color: 0x264653 });
  const snout = new THREE.Mesh(snoutGeo, snoutMat);
  snout.position.set(0.55, -0.15, 0);
  puppyHeadPivot.add(snout);

  // Cute Collar & Golden Heart Tag
  const collarGeo = new THREE.TorusGeometry(0.42, 0.08, 6, 12);
  const collarMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.rotation.y = Math.PI / 2;
  collar.position.set(0, -0.35, 0);
  puppyHeadPivot.add(collar);

  const tagGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8);
  const tagMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const tag = new THREE.Mesh(tagGeo, tagMat);
  tag.position.set(0.38, -0.42, 0);
  puppyHeadPivot.add(tag);

  puppyGroup.add(puppyHeadPivot);

  // Puppy Tail Pivot
  const puppyTailPivot = new THREE.Group();
  puppyTailPivot.position.set(-0.65, 0.9, 0);
  const tailGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 6);
  const puppyTail = new THREE.Mesh(tailGeo, earMat);
  puppyTail.rotation.z = Math.PI / 3;
  puppyTail.position.set(-0.25, 0.15, 0);
  puppyTailPivot.add(puppyTail);
  puppyGroup.add(puppyTailPivot);

  puppyGroup.position.set(-1.2, 0.6, 1.2);
  dioramaGroup.add(puppyGroup);

  // B. Curious Tabby Kitten
  const kittenGroup = new THREE.Group();
  const kittenBodyGeo = new THREE.BoxGeometry(0.85, 0.65, 0.55);
  const kittenMat = new THREE.MeshLambertMaterial({ color: 0xffb703 });
  const kittenBody = new THREE.Mesh(kittenBodyGeo, kittenMat);
  kittenBody.position.y = 0.5;
  kittenBody.castShadow = true;
  kittenGroup.add(kittenBody);

  const kittenHeadPivot = new THREE.Group();
  kittenHeadPivot.position.set(0.45, 0.95, 0);
  const kittenHeadGeo = new THREE.BoxGeometry(0.55, 0.55, 0.5);
  const kittenHead = new THREE.Mesh(kittenHeadGeo, kittenMat);
  kittenHeadPivot.add(kittenHead);

  // Pointy Ears
  const catEarGeo = new THREE.ConeGeometry(0.18, 0.35, 4);
  const catLeftEar = new THREE.Mesh(catEarGeo, earMat);
  catLeftEar.position.set(0.1, 0.35, 0.18);
  kittenHeadPivot.add(catLeftEar);

  const catRightEar = new THREE.Mesh(catEarGeo, earMat);
  catRightEar.position.set(0.1, 0.35, -0.18);
  kittenHeadPivot.add(catRightEar);

  kittenGroup.add(kittenHeadPivot);

  kittenGroup.position.set(1.5, 0.6, -1);
  dioramaGroup.add(kittenGroup);

  // C. Perched Songbird on Archway
  const birdGroup = new THREE.Group();
  const birdBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0x48cae4 })
  );
  birdGroup.add(birdBody);
  const birdBeak = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.2, 4),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  birdBeak.rotation.z = -Math.PI / 2;
  birdBeak.position.set(0.22, 0.05, 0);
  birdGroup.add(birdBeak);

  birdGroup.position.set(1.4, 4.15, -3.5);
  dioramaGroup.add(birdGroup);

  // 8. Glowing 3D Rescue Beacons (ONLY IF real incidents exist!)
  const beacons: THREE.Mesh[] = [];
  if (activeIncidentsCount > 0) {
    const beaconCount = Math.min(activeIncidentsCount, 4);
    const beaconLocations = [
      [-2.5, 0.6, 2.5],
      [2.2, 0.6, -2.5],
      [3.2, 0.6, 1.5],
      [-3.2, 0.6, -1],
    ];

    for (let i = 0; i < beaconCount; i++) {
      const [bx, by, bz] = beaconLocations[i];
      const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xff7a00,
        transparent: true,
        opacity: 0.75,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(bx, by + 3, bz);
      dioramaGroup.add(beacon);
      beacons.push(beacon);
    }
  }

  // 9. Golden Firefly / Stardust Particle Swarm
  const particleCount = 55;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 14;
    particlePositions[i + 1] = Math.random() * 7 + 0.8;
    particlePositions[i + 2] = (Math.random() - 0.5) * 14;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xfbbf24,
    size: 0.25,
    transparent: true,
    opacity: 0.85,
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  dioramaGroup.add(particleSystem);

  // 10. Mouse Interaction: 360° Drag Orbit + Cursor Head Tracking
  let isDragging = false;
  let prevMouseX = 0;
  let targetRotationY = 0;
  const mouse = { x: 0, y: 0 };

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    prevMouseX = e.clientX;
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      targetRotationY += deltaX * 0.008;
    }
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  // Mobile Touch Support
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = touch.clientX - prevMouseX;
        prevMouseX = touch.clientX;
        targetRotationY += deltaX * 0.008;
      }
    }
  };

  const onTouchEnd = () => {
    isDragging = false;
  };

  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  container.addEventListener("touchstart", onTouchStart, { passive: true });
  container.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd);

  const onResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  // 11. Animation Loop
  let animationId: number;
  const clock = new THREE.Clock();

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Island auto-sway & user orbit
    dioramaGroup.rotation.y += (targetRotationY - dioramaGroup.rotation.y) * 0.08;
    if (!isDragging) {
      targetRotationY += 0.0025;
    }

    // Puppy Idle Breathing, Tail Wag & Cursor Head Tracking
    puppyGroup.position.y = 0.6 + Math.sin(elapsedTime * 3) * 0.04;
    puppyTailPivot.rotation.z = Math.sin(elapsedTime * 12) * 0.35; // enthusiastic tail wag!
    puppyHeadPivot.rotation.y = THREE.MathUtils.lerp(puppyHeadPivot.rotation.y, mouse.x * 0.6, 0.05);
    puppyHeadPivot.rotation.x = THREE.MathUtils.lerp(puppyHeadPivot.rotation.x, -mouse.y * 0.4, 0.05);

    // Kitten Idle Sway
    kittenGroup.position.y = 0.6 + Math.cos(elapsedTime * 2.8) * 0.03;
    kittenHeadPivot.rotation.y = THREE.MathUtils.lerp(kittenHeadPivot.rotation.y, mouse.x * 0.4, 0.04);

    // Songbird Fluttering
    birdGroup.position.y = 4.15 + Math.sin(elapsedTime * 6) * 0.05;

    // Beacons Pulsing (if active incidents exist)
    beacons.forEach((b) => {
      const s = 1 + Math.sin(elapsedTime * 6) * 0.18;
      b.scale.set(s, 1, s);
    });

    // Firefly Particles Floating & Twinkling
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    for (let i = 1; i < particleCount * 3; i += 3) {
      positions[i] += 0.015;
      if (positions[i] > 8) {
        positions[i] = 0.8;
      }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  };

  animate();

  // Cleanup Callback
  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    if (container) {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
    }
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("resize", onResize);

    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }

    renderer.dispose();
  };
}

export default initThreeDiorama;
