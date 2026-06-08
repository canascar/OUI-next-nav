/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { useContext, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ThemeContext } from '../../components/with_theme';

// GLB path — loaded via webpack file-loader
const MODEL_PATH = require('../../../../src/animations/3D/OpenSearch3D.glb');

/**
 * OpenSearch3DLogo — Renders the OpenSearch 3D logo with cursor interaction.
 * Colors adapt to light/dark theme. Physics-based drag rotation with inertia.
 *
 * @param {Object} props
 * @param {number} [props.size=240] - Canvas pixel size
 */
export const OpenSearch3DLogo = ({ size = 240 }) => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera — looking straight down at the model
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.5);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    // Model group — we rotate this
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Physics — spring-based: always pulled toward idle oscillation
    const springStrength = 0.002; // Pull toward home (softer = more travel)
    const damping = 0.96; // Velocity decay (higher = more momentum on throw)
    const velocity = { x: 0, y: 0, z: 0 };
    let isDragging = false;
    let hasInteracted = false;
    let previousMouse = { x: 0, y: 0 };
    let time = 0;

    // Design palette — light vs dark
    const palettLight = [
      0x1565C0, 0x0F3D5C, 0x1565C0, 0x0F3D5C, 0x1565C0, 0x0F3D5C,
    ];
    const paletteDark = [
      0x2B8BC7, 0x7DD3FC, 0x2B8BC7, 0x7DD3FC, 0x2B8BC7, 0x7DD3FC,
    ];
    const palette = isDarkRef.current ? paletteDark : palettLight;

    // Load GLB
    const loader = new GLTFLoader();
    const modelPath = typeof MODEL_PATH === 'string' ? MODEL_PATH : MODEL_PATH.default || MODEL_PATH;

    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;

      // Compute center and base scale BEFORE applying transforms
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const modelSize = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
      const baseScale = 1 / maxDim;
      const scale = baseScale * 3;

      // Apply scale, then offset so group origin = model center
      model.scale.setScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);

      // No pre-rotation — let physics handle orientation

      // Apply glassy materials
      const colors = isDarkRef.current ? paletteDark : palettLight;
      let meshIdx = 0;
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: colors[meshIdx % colors.length],
            metalness: 0.1,
            roughness: 0.15,
            transmission: 0.3,
            thickness: 1.5,
            transparent: true,
            opacity: 0.85,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.5,
          });
          meshIdx++;
        }
      });

      modelGroup.add(model);
    });

    // Mouse tracking — passive tilt based on cursor position on page
    const mouseTarget = { x: 0, y: 0 }; // normalized -1 to 1
    const mouseCurrent = { x: 0, y: 0 }; // smoothed value
    const mouseTrackStrength = 0.25; // how much Z rotation from mouse position
    const mouseSmoothing = 0.08; // lerp factor per frame (lower = smoother)

    const onWindowMouseMove = (e) => {
      // Normalize mouse position to -1..1 relative to viewport center
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onWindowMouseMove);

    // Mouse/touch interaction
    const onPointerDown = (e) => {
      isDragging = true;
      hasInteracted = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMouse.x;
      const dy = e.clientY - previousMouse.y;
      previousMouse = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.008;
      // Directly rotate the object while dragging
      modelGroup.rotation.y += dx * sensitivity;
      modelGroup.rotation.x += dy * sensitivity;
      modelGroup.rotation.z += dx * sensitivity * 0.2;

      // Store velocity for throw momentum
      velocity.y = dx * sensitivity;
      velocity.x = dy * sensitivity;
      velocity.z = dx * sensitivity * 0.2;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointerleave', onPointerUp);

    // Animate — spring physics always active
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.012;

      // Smooth the mouse tracking (lerp toward target)
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * mouseSmoothing;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * mouseSmoothing;

      // Mouse-driven Z rotation offset (parallax tilt) — tilt toward mouse
      const mouseZOffset = -mouseCurrent.x * mouseTrackStrength;
      const mouseXOffset = mouseCurrent.y * mouseTrackStrength;
      const mouseYOffset = mouseCurrent.x * mouseTrackStrength;

      // Target = mouse tracking only (no idle oscillation)
      const targetY = mouseYOffset;
      const targetX = mouseXOffset;
      const targetZ = mouseZOffset;

      if (!hasInteracted) {
        // Pure idle — directly set position with mouse tracking
        modelGroup.rotation.y = targetY;
        modelGroup.rotation.x = targetX;
        modelGroup.rotation.z = targetZ;
      } else if (!isDragging) {
        // Spring force pulls toward target (which now includes mouse offset)
        const forceX = (targetX - modelGroup.rotation.x) * springStrength;
        const forceY = (targetY - modelGroup.rotation.y) * springStrength;
        const forceZ = (targetZ - modelGroup.rotation.z) * springStrength;

        velocity.x += forceX;
        velocity.y += forceY;
        velocity.z += forceZ;

        // Apply damping
        velocity.x *= damping;
        velocity.y *= damping;
        velocity.z *= damping;

        // Apply velocity
        modelGroup.rotation.x += velocity.x;
        modelGroup.rotation.y += velocity.y;
        modelGroup.rotation.z += velocity.z;
      }
      // When dragging, rotation is set by pointer move (velocity accumulates for throw)

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointerleave', onPointerUp);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, isDark]);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        cursor: 'grab',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
};
