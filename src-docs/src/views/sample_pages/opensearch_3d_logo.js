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

    // Physics state
    const velocity = { x: 0, y: 0, z: 0 };
    const friction = 0.995;
    let isDragging = false;
    let hasInteracted = false;
    let previousMouse = { x: 0, y: 0 };
    let time = 0;

    // Design palette
    const palette = [
      0x075985, 0x0284C7, 0x0EA5E9, 0x38BDF8, 0x7DD3FC, 0xBAE6FD,
    ];

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
      const palette = [0x075985, 0x0284C7, 0x0EA5E9, 0x38BDF8, 0x7DD3FC, 0xBAE6FD];
      let meshIdx = 0;
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: palette[meshIdx % palette.length],
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

      const sensitivity = 0.005;
      velocity.y = dx * sensitivity;
      velocity.x = dy * sensitivity;
      velocity.z = dx * sensitivity * 0.3;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointerleave', onPointerUp);

    // Animate with physics
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.012;

      if (!hasInteracted) {
        // Gentle sway — oscillate back and forth (slow)
        modelGroup.rotation.y = Math.sin(time) * 0.15;
        modelGroup.rotation.x = Math.sin(time * 0.7) * 0.04;
        modelGroup.rotation.z = Math.sin(time * 0.4) * 0.06;
      } else {
        // Physics-based after interaction
        modelGroup.rotation.x += velocity.x;
        modelGroup.rotation.y += velocity.y;
        modelGroup.rotation.z += velocity.z;

        if (!isDragging) {
          velocity.x *= friction;
          velocity.y *= friction;
          velocity.z *= friction;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
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
  }, [size]);

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
