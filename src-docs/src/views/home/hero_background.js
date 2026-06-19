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

import React, { useRef, useEffect } from 'react';

export const HeroBackground = ({ isDarkMode }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0-1

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let width;
    let height;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Mouse tracking for interactive rotation
    let isDragging = false;
    let dragVelocity = 0;
    let dragRotation = 0;
    let dragScaleVelocity = 0;
    let dragScale = 1;
    let previousMouseX = 0;
    let previousMouseY = 0;
    const dragDamping = 0.95;
    const dragSpring = 0.003;

    const onMouseMove = (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;

      if (isDragging) {
        const dx = e.clientX - previousMouseX;
        const dy = e.clientY - previousMouseY;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
        dragVelocity = dx * 0.01;
        dragRotation += dragVelocity;
        // Y movement scales the logo (drag down = shrink, drag up = grow)
        dragScaleVelocity = dy * -0.002;
        dragScale += dragScaleVelocity;
        dragScale = Math.max(0.5, Math.min(1.5, dragScale));
      }
    };

    const onPointerDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.style.cursor = 'grab';
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // Blueprint colors - faded back more
    const colors = isDarkMode
      ? {
          line: 'rgba(56, 189, 248, 0.12)',
          lineBright: 'rgba(125, 211, 252, 0.20)',
          lineFill: 'rgba(56, 189, 248, 0.06)',
          accent: 'rgba(14, 165, 233, 0.25)',
          text: 'rgba(56, 189, 248, 0.18)',
          grid: 'rgba(56, 189, 248, 0.03)',
          gridMajor: 'rgba(56, 189, 248, 0.06)',
        }
      : {
          line: 'rgba(7, 89, 133, 0.09)',
          lineBright: 'rgba(3, 105, 161, 0.16)',
          lineFill: 'rgba(7, 89, 133, 0.05)',
          accent: 'rgba(2, 132, 199, 0.20)',
          text: 'rgba(7, 89, 133, 0.14)',
          grid: 'rgba(7, 89, 133, 0.025)',
          gridMajor: 'rgba(7, 89, 133, 0.045)',
        };

    let time = 0;

    // ============================================
    // SVG Path data from the actual OpenSearch logo
    // viewBox="0 0 64 64"
    // ============================================

    // Outer arc/swoosh (primary blue)
    const outerArcPath = new Path2D(
      'M61.737 23.5a2.263 2.263 0 0 0-2.262 2.263c0 18.618-15.094 33.712-33.712 33.712a2.263 2.263 0 1 0 0 4.525C46.88 64 64 46.88 64 25.763a2.263 2.263 0 0 0-2.263-2.263Z'
    );

    // Upper teardrop (secondary/dark blue) - upper right area
    const upperTeardropPath = new Path2D(
      'M48.081 38c2.176-3.55 4.28-8.282 3.866-14.908C51.09 9.367 38.66-1.045 26.921.084c-4.596.441-9.314 4.187-8.895 10.896.182 2.916 1.61 4.637 3.928 5.96 2.208 1.26 5.044 2.057 8.259 2.961 3.883 1.092 8.388 2.32 11.85 4.87 4.15 3.058 6.986 6.603 6.018 13.229Z'
    );

    // Lower teardrop (primary blue) - lower left area
    const lowerTeardropPath = new Path2D(
      'M3.919 14C1.743 17.55-.361 22.282.052 28.908.91 42.633 13.342 53.045 25.08 51.916c4.596-.441 9.314-4.187 8.895-10.896-.182-2.916-1.61-4.637-3.928-5.96-2.208-1.26-5.044-2.057-8.259-2.961-3.883-1.092-8.388-2.32-11.85-4.87C5.787 24.17 2.95 20.625 3.919 14Z'
    );

    // ============================================
    // HELPER: Draw the OpenSearch logo using SVG paths
    // ============================================
    const drawOpenSearchLogo = (
      cx,
      cy,
      size,
      strokeColor,
      fillColor,
      lineWidth,
      rotation = 0
    ) => {
      ctx.save();

      // The SVG viewBox is 64x64, so we scale accordingly
      const scale = size / 64;

      // Translate to center, rotate, then offset
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.translate(-32 * scale, -32 * scale);
      ctx.scale(scale, scale);

      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = lineWidth / scale; // Adjust line width for scale

      // Draw outer arc
      ctx.fill(outerArcPath);
      ctx.stroke(outerArcPath);

      // Draw upper teardrop
      ctx.fill(upperTeardropPath);
      ctx.stroke(upperTeardropPath);

      // Draw lower teardrop
      ctx.fill(lowerTeardropPath);
      ctx.stroke(lowerTeardropPath);

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // ============================================
      // BLUEPRINT GRID
      // ============================================
      const gridSize = 20;
      const majorGridSize = 100;

      // Minor grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += majorGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += majorGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // ============================================
      // LOGO POSITION - Right side, scaled up
      // ============================================
      const logoX = width * 0.68;
      const logoY = height * 0.5;
      const logoSize = Math.min(width, height) * 0.85;

      // ============================================
      // CONSTRUCTION LINES (architectural guides)
      // ============================================
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([8, 4]);

      // Horizontal center line through logo
      ctx.beginPath();
      ctx.moveTo(0, logoY);
      ctx.lineTo(width, logoY);
      ctx.stroke();

      // Vertical center line through logo
      ctx.beginPath();
      ctx.moveTo(logoX, 0);
      ctx.lineTo(logoX, height);
      ctx.stroke();

      // Diagonal construction lines
      const diagLen = logoSize * 0.55;
      ctx.beginPath();
      ctx.moveTo(logoX - diagLen, logoY - diagLen);
      ctx.lineTo(logoX + diagLen, logoY + diagLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(logoX + diagLen, logoY - diagLen);
      ctx.lineTo(logoX - diagLen, logoY + diagLen);
      ctx.stroke();

      ctx.setLineDash([]);

      // ============================================
      // OPENSEARCH LOGO - Blueprint style
      // Using exact SVG paths with interactive rotation
      // ============================================
      // Spring physics: drag rotation decays back to mouse-tracking position
      if (!isDragging) {
        const targetRotation = (mouseRef.current.x - 0.5) * 0.4;
        const force = (targetRotation - dragRotation) * dragSpring;
        dragVelocity += force;
        dragVelocity *= dragDamping;
        dragRotation += dragVelocity;
        // Scale springs back to 1.0
        const scaleForce = (1.0 - dragScale) * 0.02;
        dragScaleVelocity += scaleForce;
        dragScaleVelocity *= dragDamping;
        dragScale += dragScaleVelocity;
        dragScale = Math.max(0.5, Math.min(1.5, dragScale));
      }
      const mouseRotation = dragRotation + Math.sin(time * 0.2) * 0.03;
      const finalLogoSize = logoSize * dragScale;
      drawOpenSearchLogo(
        logoX,
        logoY,
        finalLogoSize,
        colors.lineBright,
        colors.lineFill,
        2,
        mouseRotation
      );

      // Center point marker
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(logoX - 10, logoY);
      ctx.lineTo(logoX + 10, logoY);
      ctx.moveTo(logoX, logoY - 10);
      ctx.lineTo(logoX, logoY + 10);
      ctx.stroke();

      // Small center circle
      ctx.beginPath();
      ctx.arc(logoX, logoY, 4, 0, Math.PI * 2);
      ctx.stroke();

      // ============================================
      // DIMENSION LINES & MEASUREMENTS
      // ============================================
      const boundingR = logoSize * 0.5;

      // Bounding circle (dashed)
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(logoX, logoY, boundingR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Radius dimension line - slowly rotating
      const dimAngle = -Math.PI / 4 + Math.sin(time * 0.3) * 0.15;
      const dimEndX = logoX + Math.cos(dimAngle) * boundingR;
      const dimEndY = logoY + Math.sin(dimAngle) * boundingR;

      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(logoX, logoY);
      ctx.lineTo(dimEndX, dimEndY);
      ctx.stroke();

      // Dimension tick marks
      ctx.beginPath();
      ctx.moveTo(dimEndX - 4, dimEndY - 4);
      ctx.lineTo(dimEndX + 4, dimEndY + 4);
      ctx.stroke();

      // Radius label
      ctx.font = '10px monospace';
      ctx.fillStyle = colors.text;
      ctx.fillText(`R=${Math.round(boundingR)}`, dimEndX + 10, dimEndY - 8);

      // Outer diameter dimension
      const dimOffset = 30;
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;

      // Left extension line
      ctx.beginPath();
      ctx.moveTo(logoX - boundingR, logoY - boundingR - 10);
      ctx.lineTo(logoX - boundingR, logoY - boundingR - dimOffset);
      ctx.stroke();

      // Right extension line
      ctx.beginPath();
      ctx.moveTo(logoX + boundingR, logoY - boundingR - 10);
      ctx.lineTo(logoX + boundingR, logoY - boundingR - dimOffset);
      ctx.stroke();

      // Dimension line with arrows
      const dimY = logoY - boundingR - dimOffset + 5;
      ctx.beginPath();
      ctx.moveTo(logoX - boundingR, dimY);
      ctx.lineTo(logoX + boundingR, dimY);
      ctx.stroke();

      // Arrow heads
      ctx.beginPath();
      ctx.moveTo(logoX - boundingR, dimY);
      ctx.lineTo(logoX - boundingR + 6, dimY - 3);
      ctx.lineTo(logoX - boundingR + 6, dimY + 3);
      ctx.closePath();
      ctx.fillStyle = colors.line;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(logoX + boundingR, dimY);
      ctx.lineTo(logoX + boundingR - 6, dimY - 3);
      ctx.lineTo(logoX + boundingR - 6, dimY + 3);
      ctx.closePath();
      ctx.fill();

      // Diameter label
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText(`Ø${Math.round(boundingR * 2)}`, logoX, dimY - 6);
      ctx.textAlign = 'left';

      // ============================================
      // ARCHITECTURAL ARCS (animated)
      // ============================================
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 4]);

      // Concentric reference arcs - slowly rotating
      for (let i = 1; i <= 3; i++) {
        const arcRadius = boundingR + 18 * i;
        const startAngle = -Math.PI / 3 + time * 0.08;
        const endAngle = Math.PI / 6 + time * 0.08;

        ctx.beginPath();
        ctx.arc(logoX, logoY, arcRadius, startAngle, endAngle);
        ctx.stroke();
      }

      // Lower arcs - rotating opposite direction
      for (let i = 1; i <= 2; i++) {
        const arcRadius = boundingR + 15 * i;
        const startAngle = Math.PI * 0.6 - time * 0.06;
        const endAngle = Math.PI * 1.1 - time * 0.06;

        ctx.beginPath();
        ctx.arc(logoX, logoY, arcRadius, startAngle, endAngle);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // ============================================
      // ANGLE MARKERS
      // ============================================
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;

      // 45° angle marker
      const angleRadius = 35;
      ctx.beginPath();
      ctx.arc(logoX, logoY, angleRadius, -Math.PI / 4, 0);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = colors.text;
      ctx.fillText('45°', logoX + angleRadius + 5, logoY - 12);

      // 90° angle marker
      ctx.beginPath();
      ctx.arc(logoX, logoY, angleRadius * 0.7, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.fillText('90°', logoX + 10, logoY - angleRadius * 0.7 - 5);

      // ============================================
      // COORDINATE LABELS
      // ============================================
      ctx.font = '9px monospace';
      ctx.fillStyle = colors.text;

      // Origin marker at logo center
      ctx.fillText(
        `(${Math.round(logoX)}, ${Math.round(logoY)})`,
        logoX + 15,
        logoY + 25
      );

      // Grid coordinates
      for (let x = majorGridSize; x < width; x += majorGridSize * 2) {
        ctx.fillText(x.toString(), x + 2, 12);
      }
      for (let y = majorGridSize; y < height; y += majorGridSize) {
        ctx.fillText(y.toString(), 4, y - 2);
      }

      // ============================================
      // DECORATIVE TECHNICAL ELEMENTS
      // ============================================

      // Corner brackets (top-left)
      ctx.strokeStyle = colors.lineBright;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.lineTo(20, 20);
      ctx.lineTo(50, 20);
      ctx.stroke();

      // Corner brackets (bottom-left)
      ctx.beginPath();
      ctx.moveTo(20, height - 50);
      ctx.lineTo(20, height - 20);
      ctx.lineTo(50, height - 20);
      ctx.stroke();

      // Technical notation box (top-left area)
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(30, 35, 130, 55);

      ctx.font = '9px monospace';
      ctx.fillStyle = colors.text;
      ctx.fillText('OPENSEARCH AUI', 38, 50);
      ctx.fillText('DESIGN SYSTEM', 38, 63);
      ctx.fillText('SCALE: 1:1', 38, 76);
      ctx.fillText('REV: 2.0', 105, 76);

      // ============================================
      // CALLOUT LABELS for logo parts
      // ============================================
      ctx.font = '8px monospace';
      ctx.fillStyle = colors.text;
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;

      // Upper teardrop callout
      const upperCalloutX = logoX + logoSize * 0.15;
      const upperCalloutY = logoY - logoSize * 0.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(upperCalloutX, upperCalloutY);
      ctx.lineTo(upperCalloutX + 50, upperCalloutY - 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('ELEMENT A', upperCalloutX + 55, upperCalloutY - 27);

      // Lower teardrop callout
      const lowerCalloutX = logoX - logoSize * 0.2;
      const lowerCalloutY = logoY + logoSize * 0.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(lowerCalloutX, lowerCalloutY);
      ctx.lineTo(lowerCalloutX - 50, lowerCalloutY + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('ELEMENT B', lowerCalloutX - 100, lowerCalloutY + 33);

      // Arc callout
      const arcCalloutX = logoX + logoSize * 0.38;
      const arcCalloutY = logoY + logoSize * 0.25;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(arcCalloutX, arcCalloutY);
      ctx.lineTo(arcCalloutX + 40, arcCalloutY + 25);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('ARC C', arcCalloutX + 45, arcCalloutY + 28);

      time += 0.016;
      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 2,
      }}
    />
  );
};
