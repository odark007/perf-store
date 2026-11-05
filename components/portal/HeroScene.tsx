'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------
   Jarayel Technologies — interactive hero scene (three.js)
   A slowly orbiting cluster of low-poly "trade goods" items —
   RC cars, shopping carts, perfume bottles & tech artifacts —
   that drift toward the pointer, built from the brand palette.
--------------------------------------------------------- */

const PALETTE = [0xff6b4a, 0xffb627, 0x6c4fd6, 0x0e8074, 0xffffff];

function bodyMaterial(color: number) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.15, flatShading: true });
}

const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2b33, roughness: 0.5, metalness: 0.4, flatShading: true });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x1d1d24, roughness: 0.8, flatShading: true });
const hubMat = new THREE.MeshStandardMaterial({ color: 0xcfd2da, roughness: 0.3, metalness: 0.6, flatShading: true });

/* ---- RC car: chassis + cabin + spoiler + 4 wheels ---- */
function createRCCar(color: number): THREE.Group {
  const car = new THREE.Group();
  const body = bodyMaterial(color);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.36, 0.9), body);
  chassis.position.y = 0.32;
  car.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 0.75), glassMat);
  cabin.position.set(-0.08, 0.62, 0);
  car.add(cabin);

  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.85), darkMat);
  spoiler.position.set(-0.78, 0.55, 0);
  car.add(spoiler);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.07, 1.0), body);
  wing.position.set(-0.78, 0.72, 0);
  car.add(wing);

  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 10);
  const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 8);
  const positions: [number, number][] = [[0.55, 0.48], [0.55, -0.48], [-0.55, 0.48], [-0.55, -0.48]];
  positions.forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.22, z);
    car.add(wheel);
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(x, 0.22, z);
    car.add(hub);
  });

  return car;
}

/* ---- Shopping cart: basket + handle + 2 wheels ---- */
function createShoppingCart(color: number): THREE.Group {
  const cart = new THREE.Group();
  const metal = bodyMaterial(color);

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.62), metal);
  base.position.y = 0.35;
  cart.add(base);

  const front = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.62), metal);
  front.position.set(0.44, 0.58, 0);
  cart.add(front);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.62), metal);
  back.position.set(-0.44, 0.58, 0);
  cart.add(back);

  [-0.29, 0.29].forEach((z) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.05), metal);
    side.position.set(0, 0.58, z);
    cart.add(side);
  });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 8), darkMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(-0.5, 0.82, 0);
  cart.add(handle);

  const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8);
  [[-0.3, 0.22], [0.3, 0.22], [-0.3, -0.22], [0.3, -0.22]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.09, z);
    cart.add(wheel);
  });

  return cart;
}

/* ---- Perfume bottle: faceted flacon + neck + cap ---- */
function createPerfumeBottle(color: number): THREE.Group {
  const bottle = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.85, 6), bodyMaterial(color));
  body.position.y = 0.45;
  bottle.add(body);

  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.32, 0.22, 6), bodyMaterial(color));
  shoulder.position.y = 0.98;
  bottle.add(shoulder);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), glassMat);
  cap.position.y = 1.2;
  bottle.add(cap);

  return bottle;
}

/* ---- Robot head (AI tech artifact) ---- */
function createRobotHead(color: number): THREE.Group {
  const bot = new THREE.Group();
  const body = bodyMaterial(color);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), body);
  head.position.y = 0.6;
  bot.add(head);

  [-0.2, 0.2].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8), glassMat);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(x, 0.65, 0.31);
    bot.add(eye);
  });

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), darkMat);
  antenna.position.set(0.25, 1.05, 0);
  bot.add(antenna);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), body);
  tip.position.set(0.25, 1.24, 0);
  bot.add(tip);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.18, 8), darkMat);
  neck.position.y = 0.22;
  bot.add(neck);

  return bot;
}

/* ---- Drone (tech artifact): core + 4 rotor arms ---- */
function createDrone(color: number): THREE.Group {
  const drone = new THREE.Group();
  const body = bodyMaterial(color);

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), body);
  core.position.y = 0.45;
  drone.add(core);

  const armGeo = new THREE.BoxGeometry(0.5, 0.05, 0.09);
  const rotorGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.04, 8);
  const corners: [number, number][] = [[0.32, 0.32], [0.32, -0.32], [-0.32, 0.32], [-0.32, -0.32]];
  corners.forEach(([x, z]) => {
    const arm = new THREE.Mesh(armGeo, darkMat);
    arm.position.set(x / 2, 0.45, z / 2);
    arm.rotation.y = Math.atan2(z, x);
    drone.add(arm);
    const rotor = new THREE.Mesh(rotorGeo, glassMat);
    rotor.position.set(x, 0.5, z);
    drone.add(rotor);
  });

  return drone;
}

const FACTORIES = [createRCCar, createShoppingCart, createPerfumeBottle, createRobotHead, createDrone];

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight * (window.innerWidth <= 860 ? 0.7 : 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Lights — warm + cool for a lively marketplace feel
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xffb627, 1.4, 60);
    keyLight.position.set(10, 8, 12);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x6c4fd6, 1.1, 60);
    fillLight.position.set(-10, -6, 8);
    scene.add(fillLight);

    // Build a cluster of low-poly "trade goods" items
    const group = new THREE.Group();
    const items: THREE.Group[] = [];

    const isMobile = window.innerWidth <= 860;
    const count = isMobile ? 10 : 16;

    for (let i = 0; i < count; i++) {
      const factory = FACTORIES[i % FACTORIES.length];
      const item = factory(PALETTE[i % PALETTE.length]);

      const radius = 4 + Math.random() * 5.5;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      item.position.set(
        Math.cos(angle) * radius * 0.9 + 2.5,
        Math.sin(angle) * radius * 0.55 + Math.random() * 2 - 1,
        (Math.random() - 0.5) * 6
      );

      const scale = 0.4 + Math.random() * 0.5;
      item.scale.setScalar(scale);
      item.rotation.set(Math.random() * 0.4 - 0.2, Math.random() * Math.PI, 0);

      item.userData.spin = { y: (Math.random() - 0.5) * 0.008 };
      item.userData.floatSeed = Math.random() * Math.PI * 2;
      item.userData.basePos = item.position.clone();

      group.add(item);
      items.push(item);
    }

    scene.add(group);
    group.position.x = isMobile ? 0 : 2.4;

    // Pointer parallax
    let targetRotY = 0;
    let targetRotX = 0;

    function onPointerMove(e: MouseEvent | TouchEvent) {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const pointerX = (x / window.innerWidth) * 2 - 1;
      const pointerY = (y / window.innerHeight) * 2 - 1;
      targetRotY = pointerX * 0.35;
      targetRotX = pointerY * 0.2;
    }
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    function onResize() {
      width = window.innerWidth;
      const mobile = window.innerWidth <= 860;
      height = window.innerHeight * (mobile ? 0.7 : 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
      group.rotation.y += 0.0009; // gentle ambient drift

      items.forEach((item) => {
        item.rotation.y += item.userData.spin.y;
        item.position.y = item.userData.basePos.y + Math.sin(t * 0.6 + item.userData.floatSeed) * 0.25;
      });

      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      renderer.render(scene, camera); // single static frame
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('resize', onResize);
      items.forEach((item) => {
        item.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            (obj.material as THREE.Material).dispose();
          }
        });
      });
      glassMat.dispose();
      darkMat.dispose();
      tireMat.dispose();
      hubMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-[100vh] max-[860px]:h-[70vh] z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
