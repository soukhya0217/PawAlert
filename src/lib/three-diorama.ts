import * as THREE from "three";

export interface DioramaOptions {
  container: HTMLDivElement;
  activeIncidentsCount?: number;
}

export function initThreeDiorama({ container, activeIncidentsCount = 0 }: DioramaOptions) {
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 400;

  // 1. Scene & Camera Setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(14, 12, 16);
  camera.lookAt(0, 1, 0);

  // 2. WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 3. Lighting Setup (Sunlit Meadow Atmosphere)
  const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
  sunLight.position.set(15, 25, 12);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x2ec4b6, 0.4);
  fillLight.position.set(-10, 8, -10);
  scene.add(fillLight);

  // Root Diorama Group
  const dioramaGroup = new THREE.Group();
  scene.add(dioramaGroup);

  // 4. Floating Island Base
  // Top Meadow
  const topGeo = new THREE.CylinderGeometry(7.5, 7.8, 1.2, 8);
  const topMat = new THREE.MeshLambertMaterial({ color: 0x95d5b2 });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 0;
  topMesh.receiveShadow = true;
  dioramaGroup.add(topMesh);

  // Earth Sub-layers
  const earthGeo = new THREE.CylinderGeometry(7.8, 3.5, 4.5, 8);
  const earthMat = new THREE.MeshLambertMaterial({ color: 0xb08968 });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthMesh.position.y = -2.6;
  dioramaGroup.add(earthMesh);

  // Pond
  const pondGeo = new THREE.CircleGeometry(2.2, 16);
  const pondMat = new THREE.MeshBasicMaterial({ color: 0x48cae4 });
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.rotation.x = -Math.PI / 2;
  pondMesh.position.set(2.2, 0.62, 1.8);
  dioramaGroup.add(pondMesh);

  // 5. Low-Poly Trees with Wind Sway
  const trees: THREE.Group[] = [];
  const treePositions = [
    [-4, 0.6, -3],
    [-2.5, 0.6, -4.5],
    [4.2, 0.6, -3],
    [-4.5, 0.6, 2],
  ];

  treePositions.forEach(([x, y, z]) => {
    const tree = new THREE.Group();
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6f4e37 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    tree.add(trunk);

    // Leaves
    const leavesGeo = new THREE.ConeGeometry(1.3, 2.2, 6);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x52b788 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 2.2;
    leaves.castShadow = true;
    tree.add(leaves);

    tree.position.set(x, y, z);
    dioramaGroup.add(tree);
    trees.push(tree);
  });

  // 6. Procedural Low-Poly Animals
  // Dog Group
  const dog = new THREE.Group();
  const dogBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.8, 0.7),
    new THREE.MeshLambertMaterial({ color: 0xe09f3e })
  );
  dogBody.position.y = 0.7;
  dogBody.castShadow = true;
  dog.add(dogBody);

  const dogHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.6),
    new THREE.MeshLambertMaterial({ color: 0xe09f3e })
  );
  dogHead.position.set(0.7, 1.2, 0);
  dogHead.castShadow = true;
  dog.add(dogHead);

  const dogSnout = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.4),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  dogSnout.position.set(1.1, 1.1, 0);
  dog.add(dogSnout);

  dog.position.set(-1, 0.6, 1);
  dioramaGroup.add(dog);

  // Cat Group
  const cat = new THREE.Group();
  const catBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.6, 0.5),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  catBody.position.y = 0.5;
  catBody.castShadow = true;
  cat.add(catBody);

  const catHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  catHead.position.set(0.5, 0.9, 0);
  cat.add(catHead);

  cat.position.set(1.5, 0.6, -1.2);
  dioramaGroup.add(cat);

  // 7. Dynamic Beacons (ONLY spawned if active incidents > 0!)
  const beacons: THREE.Mesh[] = [];
  if (activeIncidentsCount > 0) {
    const beaconCount = Math.min(activeIncidentsCount, 4);
    const beaconSpots = [
      [2.5, 0.6, 2],
      [-2.5, 0.6, 2.5],
      [0, 0.6, -2.5],
      [-3, 0.6, -1],
    ];

    for (let i = 0; i < beaconCount; i++) {
      const [bx, by, bz] = beaconSpots[i];
      const beaconGeo = new THREE.CylinderGeometry(0.25, 0.25, 5, 12);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xff5a4e,
        transparent: true,
        opacity: 0.65,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(bx, by + 2.5, bz);
      dioramaGroup.add(beacon);
      beacons.push(beacon);
    }
  }

  // 8. Peaceful Meadow Pollen Particles (When sanctuary is peaceful)
  const particleCount = 40;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 12;
    particlePos[i + 1] = Math.random() * 6 + 1;
    particlePos[i + 2] = (Math.random() - 0.5) * 12;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffb703,
    size: 0.18,
    transparent: true,
    opacity: 0.7,
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  dioramaGroup.add(particleSystem);

  // 9. Interactive Drag / Orbit Parallax
  let isDragging = false;
  let prevMouseX = 0;
  let targetRotationY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    prevMouseX = e.clientX;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    prevMouseX = e.clientX;
    targetRotationY += deltaX * 0.008;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  // Resize Listener
  const onResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  // 10. Animation Loop
  let animationId: number;
  let clock = new THREE.Clock();

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth Island Rotation with user drag + gentle auto-sway
    dioramaGroup.rotation.y += (targetRotationY - dioramaGroup.rotation.y) * 0.08;
    if (!isDragging) {
      targetRotationY += 0.002;
    }

    // Animal Idle Breathing & Bobbing
    dog.position.y = 0.6 + Math.sin(elapsedTime * 2.5) * 0.04;
    dog.rotation.z = Math.sin(elapsedTime * 2) * 0.02;

    cat.position.y = 0.6 + Math.cos(elapsedTime * 2.8) * 0.03;

    // Trees Gentle Wind Sway
    trees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(elapsedTime * 1.5 + idx) * 0.03;
    });

    // Beacons Pulsing (if active)
    beacons.forEach((b) => {
      b.scale.set(1 + Math.sin(elapsedTime * 5) * 0.15, 1, 1 + Math.sin(elapsedTime * 5) * 0.15);
    });

    // Floating Pollen Particles Rise
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    for (let i = 1; i < particleCount * 3; i += 3) {
      positions[i] += 0.01;
      if (positions[i] > 7) {
        positions[i] = 1;
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
    window.removeEventListener("resize", onResize);

    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }

    renderer.dispose();
  };
}

export default initThreeDiorama;
