"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import anime from "animejs";
import { Sparkles, RotateCcw } from "lucide-react";

interface PipWelcomeSceneProps {
  isInputFocused?: boolean;
}

export default function PipWelcomeScene({ isInputFocused = false }: PipWelcomeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animTimelineRef = useRef<anime.AnimeTimelineInstance | null>(null);

  // References for live 3D animation controls
  const pipRigRef = useRef<{
    pipGroup: THREE.Group;
    headGroup: THREE.Group;
    tailGroup: THREE.Group;
    earLeft: THREE.Group;
    earRight: THREE.Group;
    eyeLeft: THREE.Mesh;
    eyeRight: THREE.Mesh;
    camera: THREE.PerspectiveCamera;
    logoGroup: THREE.Group;
    sunbeams: THREE.Mesh;
  } | null>(null);

  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff9f0); // Warm sunlit cream
    scene.fog = new THREE.FogExp2(0xfff9f0, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    // Initial camera position centered on Pip's face
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting: Morning Sunbeams & Warm Radiance
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 1.3);
    scene.add(ambientLight);

    // Morning golden sunlight from high-left window
    const sunLight = new THREE.DirectionalLight(0xffb703, 2.2);
    sunLight.position.set(-3.5, 6, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Soft warm fill light from front-right
    const fillLight = new THREE.PointLight(0xff7a00, 1.1, 10);
    fillLight.position.set(2.5, 2.5, 2.5);
    scene.add(fillLight);

    // 3. Environment: Cozy Wooden Floorboards & Window Frame
    // Wooden Floor
    const floorGeo = new THREE.PlaneGeometry(14, 14, 16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe6a86c, // Warm Honey Amber Oak
      roughness: 0.55,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Decorative baseboard wall
    const wallGeo = new THREE.PlaneGeometry(14, 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfff4e6, // Sunlit soft parchment wall
      roughness: 0.9,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 4.5, -4);
    wall.receiveShadow = true;
    scene.add(wall);

    // Cozy Window Frame (Background left)
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-2.4, 3.8, -3.9);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfff1dc, transparent: true, opacity: 0.85 });
    
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), glassMat);
    windowGroup.add(glass);

    // Outer & Cross Frames
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), frameMat);
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.3, 0.1), frameMat);
    windowGroup.add(hBar, vBar);
    scene.add(windowGroup);

    // Volumetric Morning Sunbeam Cone (God-rays streaming from window)
    const sunbeamGeo = new THREE.CylinderGeometry(0.5, 3.2, 8, 24, 1, true);
    const sunbeamMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunbeams = new THREE.Mesh(sunbeamGeo, sunbeamMat);
    sunbeams.position.set(-1.2, 4.2, -1.2);
    sunbeams.rotation.z = Math.PI / 4.8;
    sunbeams.rotation.x = Math.PI / 12;
    scene.add(sunbeams);

    // Floating Dust Mote & Golden Paw Sparkle Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 6;
      particlePos[i * 3 + 1] = Math.random() * 5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Hero Character: PIP (Joyful Stylized 3D Golden-Fluffy Puppy)
    const pipGroup = new THREE.Group();
    pipGroup.position.set(0, 0, 0);

    // Materials
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm golden retriever honey fluff
      roughness: 0.65,
      metalness: 0.02,
    });
    const creamFurMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed, // Soft warm muzzle/chest cream
      roughness: 0.7,
    });
    const darkFeatureMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Twilight glossy black
      roughness: 0.15,
      metalness: 0.1,
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // Cheerful puppy tongue pink
      roughness: 0.3,
    });
    const eyeGlossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3 });
    const goldTagMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
    });

    // --- PIP'S BODY ---
    const bodyGeo = new THREE.SphereGeometry(0.55, 24, 24);
    bodyGeo.scale(0.95, 1.1, 0.95);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.set(0, 0.62, 0);
    body.castShadow = true;
    pipGroup.add(body);

    // Cute cream chest fluff patch
    const chestGeo = new THREE.SphereGeometry(0.35, 16, 16);
    chestGeo.scale(0.8, 1, 0.5);
    const chest = new THREE.Mesh(chestGeo, creamFurMat);
    chest.position.set(0, 0.68, 0.35);
    pipGroup.add(chest);

    // --- PIP'S HEAD & NECK ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0.1);

    // Head Base (Chubby cheeks)
    const headGeo = new THREE.SphereGeometry(0.48, 28, 28);
    headGeo.scale(1.08, 0.96, 1.0);
    const head = new THREE.Mesh(headGeo, furMat);
    head.castShadow = true;
    headGroup.add(head);

    // Muzzle / Snout
    const muzzleGeo = new THREE.SphereGeometry(0.24, 20, 20);
    muzzleGeo.scale(1.15, 0.85, 1.2);
    const muzzle = new THREE.Mesh(muzzleGeo, creamFurMat);
    muzzle.position.set(0, -0.06, 0.38);
    muzzle.castShadow = true;
    headGroup.add(muzzle);

    // Cute Black Button Nose
    const noseGeo = new THREE.SphereGeometry(0.065, 14, 14);
    noseGeo.scale(1.1, 0.8, 0.9);
    const nose = new THREE.Mesh(noseGeo, darkFeatureMat);
    nose.position.set(0, 0.05, 0.58);
    headGroup.add(nose);

    // Happy Mouth & Poking Pink Tongue
    const tongueGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.1, 14);
    const tongue = new THREE.Mesh(tongueGeo, pinkMat);
    tongue.position.set(0, -0.16, 0.44);
    tongue.rotation.x = Math.PI / 4;
    headGroup.add(tongue);

    // --- PIP'S SOULFUL PIXAR EYES (Large, glossy, sparkling highlights) ---
    const createEye = (x: number) => {
      const eyePivot = new THREE.Group();
      eyePivot.position.set(x, 0.1, 0.36);

      // Sclera / Base
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 18), darkFeatureMat);
      eyePivot.add(pupil);

      // Big primary glossy highlight
      const hlPrimary = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), eyeGlossMat);
      hlPrimary.position.set(0.02, 0.03, 0.075);
      eyePivot.add(hlPrimary);

      // Cute secondary bounce catchlight
      const hlSecondary = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeGlossMat);
      hlSecondary.position.set(-0.03, -0.025, 0.075);
      eyePivot.add(hlSecondary);

      return { eyePivot, pupil };
    };

    const eyeLeftObj = createEye(-0.19);
    const eyeRightObj = createEye(0.19);
    headGroup.add(eyeLeftObj.eyePivot, eyeRightObj.eyePivot);

    // --- PIP'S FLOPPY EARS ---
    const createEar = (isRight: boolean) => {
      const earGroup = new THREE.Group();
      const earGeo = new THREE.CylinderGeometry(0.08, 0.18, 0.55, 16);
      earGeo.scale(0.8, 1, 0.5);
      const earMesh = new THREE.Mesh(earGeo, furMat);
      earMesh.position.set(0, -0.22, 0);
      earMesh.castShadow = true;
      earGroup.add(earMesh);

      // Inner soft ear flap
      const innerEarGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.45, 12);
      innerEarGeo.scale(0.6, 1, 0.2);
      const innerMesh = new THREE.Mesh(innerEarGeo, creamFurMat);
      innerMesh.position.set(0, -0.22, 0.08);
      earGroup.add(innerMesh);

      const sign = isRight ? 1 : -1;
      earGroup.position.set(sign * 0.42, 0.22, 0);
      earGroup.rotation.z = sign * 0.35;
      earGroup.rotation.x = 0.15;

      return earGroup;
    };

    const earLeft = createEar(false);
    const earRight = createEar(true);
    headGroup.add(earLeft, earRight);

    // --- PIP'S ROYAL COLLAR & GOLDEN HEART TAG ---
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 12, 28), collarMat);
    collar.position.set(0, -0.28, 0.02);
    collar.rotation.x = Math.PI / 2.2;
    headGroup.add(collar);

    // Golden heart pendant
    const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 16), goldTagMat);
    tag.position.set(0, -0.37, 0.38);
    tag.rotation.x = Math.PI / 2;
    headGroup.add(tag);

    pipGroup.add(headGroup);

    // --- PIP'S LEGS & PAWS ---
    const createPaw = (x: number, z: number) => {
      const pawGroup = new THREE.Group();
      pawGroup.position.set(x, 0.12, z);

      const pawMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), creamFurMat);
      pawMesh.scale.set(1.1, 0.7, 1.3);
      pawMesh.castShadow = true;
      pawGroup.add(pawMesh);

      return pawGroup;
    };

    // Front paws
    const pawFrontLeft = createPaw(-0.25, 0.42);
    const pawFrontRight = createPaw(0.25, 0.42);
    pipGroup.add(pawFrontLeft, pawFrontRight);

    // Hind sitting legs
    const hindLeft = createPaw(-0.46, 0.05);
    const hindRight = createPaw(0.46, 0.05);
    pipGroup.add(hindLeft, hindRight);

    // --- PIP'S WAGGING FLUFFY TAIL ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.38, -0.42);

    const tailGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.5, 14);
    const tailMesh = new THREE.Mesh(tailGeo, furMat);
    tailMesh.position.set(0, 0.22, -0.15);
    tailMesh.rotation.x = -Math.PI / 3.5;
    tailMesh.castShadow = true;
    tailGroup.add(tailMesh);

    // White fluffy tail tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), creamFurMat);
    tip.position.set(0, 0.42, -0.28);
    tailGroup.add(tip);

    pipGroup.add(tailGroup);
    scene.add(pipGroup);

    // 5. 3D GLOWING PAWALERT LOGO SUSPENDED IN SUNBEAMS
    const logoGroup = new THREE.Group();
    logoGroup.position.set(0, 2.7, -0.5);

    // Glowing Central Golden Emblem Shield
    const shieldGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 32);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xff7a00,
      metalness: 0.3,
      roughness: 0.25,
      emissive: 0xff7a00,
      emissiveIntensity: 0.35,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.rotation.x = Math.PI / 2;
    logoGroup.add(shield);

    // Inner Radiant Golden Paw Pad inside Shield
    const pawCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffb703,
        emissive: 0xffb703,
        emissiveIntensity: 0.6,
      })
    );
    pawCenter.position.set(0, 0, 0.08);
    logoGroup.add(pawCenter);

    // Floating Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.9, 0.035, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.8,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    logoGroup.add(halo);

    // Orbiting Golden Paw Sparkle Spheres around the 3D Logo
    const orbitGroup = new THREE.Group();
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    for (let s = 0; s < 4; s++) {
      const angle = (s / 4) * Math.PI * 2;
      const sparkleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), sparkleMat);
      sparkleMesh.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0);
      orbitGroup.add(sparkleMesh);
    }
    logoGroup.add(orbitGroup);

    scene.add(logoGroup);

    // Store references
    pipRigRef.current = {
      pipGroup,
      headGroup,
      tailGroup,
      earLeft,
      earRight,
      eyeLeft: eyeLeftObj.pupil,
      eyeRight: eyeRightObj.pupil,
      camera,
      logoGroup,
      sunbeams,
    };

    // 6. Camera Tilt & 3D Logo Reveal Timeline (Anime.js)
    const runIntroCinematic = () => {
      setIntroFinished(false);

      // Start at Pip's eye level
      camera.position.set(0, 1.35, 3.8);
      camera.lookAt(0, 1.25, 0);

      const animObj = {
        camY: 1.35,
        camZ: 3.8,
        lookY: 1.25,
        beamOpacity: 0.12,
        logoScale: 0.4,
      };

      if (animTimelineRef.current) animTimelineRef.current.pause();

      animTimelineRef.current = anime.timeline({
        easing: "easeInOutCubic",
        complete: () => setIntroFinished(true),
      });

      animTimelineRef.current
        .add({
          targets: animObj,
          camY: [1.35, 2.3],
          camZ: [3.8, 4.4],
          lookY: [1.25, 2.1],
          beamOpacity: [0.12, 0.28],
          logoScale: [0.4, 1.05],
          duration: 1800,
          delay: 200,
          update: () => {
            camera.position.y = animObj.camY;
            camera.position.z = animObj.camZ;
            camera.lookAt(0, animObj.lookY, 0);
            sunbeamMat.opacity = animObj.beamOpacity;
            logoGroup.scale.setScalar(animObj.logoScale);
          },
        })
        .add({
          targets: animObj,
          camY: 2.15,
          lookY: 1.95,
          logoScale: 1.0,
          duration: 700,
          easing: "easeOutElastic(1, 0.6)",
          update: () => {
            camera.position.y = animObj.camY;
            camera.lookAt(0, animObj.lookY, 0);
            logoGroup.scale.setScalar(animObj.logoScale);
          },
        });
    };

    runIntroCinematic();

    // 7. Mouse Pointer Tracking
    let mouseX = 0;
    let mouseY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", handlePointerMove);

    // 8. 60FPS Continuous Animation Loop
    let animFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Tail wagging physics (accelerates if user is typing/focused)
      const wagSpeed = isInputFocused ? 14 : 7;
      const wagAngle = isInputFocused ? 0.65 : 0.42;
      tailGroup.rotation.y = Math.sin(elapsed * wagSpeed) * wagAngle;

      // Gentle breathing body compression
      body.scale.y = 1.1 + Math.sin(elapsed * 2.8) * 0.035;
      body.scale.x = 0.95 - Math.sin(elapsed * 2.8) * 0.015;

      // Head cursor follow with soft damping
      const targetHeadX = mouseX * 0.28;
      const targetHeadY = mouseY * 0.2;
      headGroup.rotation.y += (targetHeadX - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (-targetHeadY - headGroup.rotation.x) * 0.08;

      // Ear perk reaction on input focus
      const targetEarTilt = isInputFocused ? 0.55 : 0.35;
      earLeft.rotation.z = -targetEarTilt + Math.sin(elapsed * 4) * 0.05;
      earRight.rotation.z = targetEarTilt - Math.sin(elapsed * 4) * 0.05;

      // Periodic natural eye blink
      blinkTimer += 0.016;
      if (blinkTimer > 3.6) {
        eyeLeftObj.pupil.scale.y = 0.1;
        eyeRightObj.pupil.scale.y = 0.1;
        if (blinkTimer > 3.75) {
          eyeLeftObj.pupil.scale.y = 1;
          eyeRightObj.pupil.scale.y = 1;
          blinkTimer = 0;
        }
      }

      // Rotate 3D Logo Halo, Orbiting Sparkles & Drift Sunbeams
      logoGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.15;
      halo.rotation.z = elapsed * 0.6;
      orbitGroup.rotation.z = -elapsed * 1.2;
      sunbeams.rotation.y = Math.sin(elapsed * 0.4) * 0.08;

      // Drift dust mote particles upward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.003;
        if (positions[i] > 5) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 9. Thorough Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      if (animTimelineRef.current) {
        animTimelineRef.current.pause();
      }

      // Dispose all geometries and materials
      scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isInputFocused]);

  const handleReplayIntro = () => {
    if (!pipRigRef.current) return;
    const { camera, logoGroup, sunbeams } = pipRigRef.current;

    camera.position.set(0, 1.35, 3.8);
    camera.lookAt(0, 1.25, 0);

    const animObj = {
      camY: 1.35,
      camZ: 3.8,
      lookY: 1.25,
      beamOpacity: 0.12,
      logoScale: 0.4,
    };

    setIntroFinished(false);

    anime({
      targets: animObj,
      camY: [1.35, 2.15],
      camZ: [3.8, 4.4],
      lookY: [1.25, 1.95],
      beamOpacity: [0.12, 0.28],
      logoScale: [0.4, 1.0],
      duration: 1800,
      easing: "easeInOutCubic",
      update: () => {
        camera.position.y = animObj.camY;
        camera.position.z = animObj.camZ;
        camera.lookAt(0, animObj.lookY, 0);
        if (sunbeams.material instanceof THREE.Material) {
          (sunbeams.material as THREE.MeshBasicMaterial).opacity = animObj.beamOpacity;
        }
        logoGroup.scale.setScalar(animObj.logoScale);
      },
      complete: () => setIntroFinished(true),
    });
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-full min-h-[420px] rounded-[28px] sm:rounded-[36px] border-[3px] sm:border-[4px] border-[#1E1B4B] bg-[#FFF9F0] overflow-hidden shadow-pixar">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Staggered Spring-Fade Typography Overlay */}
      <div className="pointer-events-none absolute inset-x-4 top-5 z-20 flex flex-col items-center text-center">
        {/* Sub-badge: PAWALERT - Every Paw Matters */}
        <div className="inline-flex items-center gap-1.5 rounded-[14px] border-[2px] border-[#1E1B4B] bg-[#FFB703] px-3.5 py-1 text-xs font-display font-black text-[#1E1B4B] shadow-pixar-sm mb-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <span>🐾</span>
          <span>PAWALERT – Every Paw Matters</span>
        </div>

        {/* Headline: THEY CAN'T SPEAK. YOU CAN. */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#1E1B4B] tracking-tight drop-shadow-sm font-pixar-3d animate-in fade-in zoom-in-95 duration-700">
          THEY CAN&apos;T SPEAK. <br />
          <span className="text-[#FF7A00]">YOU CAN.</span>
        </h2>
        <p className="text-xs sm:text-sm font-sans font-bold text-[#1E1B4B]/80 max-w-sm mt-1 drop-shadow-sm">
          Pip and 1,200+ neighborhood rescue squads are waiting for your guardian alert.
        </p>
      </div>

      {/* Bottom Controls: Replay Intro Button & Interactive Reaction Pill */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between gap-2">
        <button
          onClick={handleReplayIntro}
          className="pixar-btn inline-flex items-center gap-1.5 rounded-[16px] bg-[#FFF9F0]/90 backdrop-blur-md px-3 py-1.5 text-xs font-display font-bold text-[#1E1B4B] border-[2px] border-[#1E1B4B] shadow-pixar-sm hover:bg-[#FFF1DC]"
          title="Replay cinematic camera tilt and logo reveal"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>✨ Replay Intro</span>
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0]/90 px-3 py-1.5 text-[11px] font-display font-bold text-[#1E1B4B] shadow-pixar-sm backdrop-blur-md">
          <span className={`h-2.5 w-2.5 rounded-full ${isInputFocused ? "bg-[#10B981] animate-ping" : "bg-[#FFB703]"}`} />
          <span>{isInputFocused ? "Pip is listening closely! 🐶" : "Move cursor to play with Pip"}</span>
        </div>
      </div>
    </div>
  );
}
