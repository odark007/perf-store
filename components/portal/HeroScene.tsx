'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------
   Jarayel Technologies — interactive hero scene (three.js)
   A slowly orbiting cluster of low-poly "trade goods" shapes
   that drift toward the pointer, built from the brand palette.
   Ported from: jara landingpage/files/script.js
--------------------------------------------------------- */
export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = [0xff6b4a, 0xffb627, 0x6c4fd6, 0x0e8074, 0xffffff];

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

    // Build a cluster of geometric "goods"
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];

    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.7, 0.26, 10, 24),
      new THREE.TetrahedronGeometry(1.1, 0),
      new THREE.DodecahedronGeometry(0.9, 0),
    ];

    const isMobile = window.innerWidth <= 860;
    const count = isMobile ? 10 : 16;

    for (let i = 0; i < count; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.35,
        metalness: 0.15,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);

      const radius = 4 + Math.random() * 5.5;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      mesh.position.set(
        Math.cos(angle) * radius * 0.9 + 2.5,
        Math.sin(angle) * radius * 0.55 + Math.random() * 2 - 1,
        (Math.random() - 0.5) * 6
      );

      const scale = 0.35 + Math.random() * 0.55;
      mesh.scale.setScalar(scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData.spin = {
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.006,
      };
      mesh.userData.floatSeed = Math.random() * Math.PI * 2;
      mesh.userData.basePos = mesh.position.clone();

      group.add(mesh);
      meshes.push(mesh);
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

      meshes.forEach((m) => {
        m.rotation.x += m.userData.spin.x;
        m.rotation.y += m.userData.spin.y;
        m.position.y = m.userData.basePos.y + Math.sin(t * 0.6 + m.userData.floatSeed) * 0.25;
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
      geometries.forEach((g) => g.dispose());
      meshes.forEach((m) => (m.material as THREE.Material).dispose());
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
