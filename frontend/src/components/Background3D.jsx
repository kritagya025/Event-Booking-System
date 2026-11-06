import React, { useEffect, useRef } from 'react';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for smooth parallax
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // ─── 3D Math Utilities ───
    const rotX = (p, a) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotZ = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];

    // ─── 3D Wireframe Models ───
    // 1. Concert Ticket Pass (Extruded 3D stub)
    const ticketVertices = [
      [-45, -28, -6], [45, -28, -6], [45, 28, -6], [-45, 28, -6],
      [-45, -28, 6], [45, -28, 6], [45, 28, 6], [-45, 28, 6],
      [-15, -28, -6], [-15, 28, -6], [-15, -28, 6], [-15, 28, 6] // perforation line
    ];
    const ticketEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // connectors
      [8, 9], [10, 11] // perforation
    ];

    // 2. Octahedron (VIP Stage Crystal)
    const octaVertices = [
      [0, -42, 0], [0, 42, 0],
      [-30, 0, -30], [30, 0, -30], [30, 0, 30], [-30, 0, 30]
    ];
    const octaEdges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [3, 4], [4, 5], [5, 2]
    ];

    // 3. Cyber Cube (Industrial FOH Speaker Box)
    const cubeVertices = [
      [-32, -32, -32], [32, -32, -32], [32, 32, -32], [-32, 32, -32],
      [-32, -32, 32], [32, -32, 32], [32, 32, 32], [-32, 32, 32]
    ];
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
      [0, 6], [1, 7] // cross braces
    ];

    // Floating Object Instances positioned in 3D world coordinates
    const objects = [
      {
        type: 'ticket',
        vertices: ticketVertices,
        edges: ticketEdges,
        pos: [-0.38, -0.22, 120], // normalized [-1..1]
        rot: [0.2, 0.4, -0.1],
        rotSpeed: [0.007, 0.012, 0.005],
        floatPhase: 0,
        color: '#EEFC54',
        accentColor: '#FF1F6D',
        scale: 1.1
      },
      {
        type: 'octa',
        vertices: octaVertices,
        edges: octaEdges,
        pos: [0.42, -0.25, 140],
        rot: [-0.3, 0.5, 0.2],
        rotSpeed: [0.011, -0.009, 0.006],
        floatPhase: 1.8,
        color: '#FF1F6D',
        accentColor: '#EEFC54',
        scale: 1.05
      },
      {
        type: 'cube',
        vertices: cubeVertices,
        edges: cubeEdges,
        pos: [-0.44, 0.32, 160],
        rot: [0.4, -0.3, 0.3],
        rotSpeed: [-0.008, 0.011, -0.007],
        floatPhase: 3.5,
        color: '#1d4ed8',
        accentColor: '#EEFC54',
        scale: 0.95
      },
      {
        type: 'octa',
        vertices: octaVertices,
        edges: octaEdges,
        pos: [0.44, 0.36, 180],
        rot: [0.5, 0.2, -0.4],
        rotSpeed: [0.009, 0.013, -0.008],
        floatPhase: 5.1,
        color: '#EEFC54',
        accentColor: '#FF1F6D',
        scale: 0.85
      }
    ];

    // Floating dust particles
    const particles = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 900,
      z: Math.random() * 600 - 100,
      speedZ: Math.random() * 0.4 + 0.15,
      size: Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.45 ? '#EEFC54' : '#FF1F6D'
    }));

    let time = 0;

    // ─── Render Loop ───
    const render = () => {
      time += 0.016;

      // Smooth mouse parallax damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      const parallaxX = (mouse.x - width / 2) * 0.08;
      const parallaxY = (mouse.y - height / 2) * 0.06;

      const isLight = document.documentElement.classList.contains('light');

      ctx.clearRect(0, 0, width, height);

      // ─── 1. Volumetric Sweeping Stage Spotlight Beams ───
      const beamPhase1 = Math.sin(time * 0.4) * 0.35;
      const beamPhase2 = Math.cos(time * 0.35) * 0.35;

      // Left Stage Spotlight (Neon Magenta)
      const gradLeft = ctx.createRadialGradient(
        width * 0.2 + parallaxX * 0.5, 
        0, 
        10, 
        width * 0.25 + beamPhase1 * 300, 
        height * 0.75, 
        width * 0.65
      );
      gradLeft.addColorStop(0, isLight ? 'rgba(255, 31, 109, 0.08)' : 'rgba(255, 31, 109, 0.14)');
      gradLeft.addColorStop(0.5, isLight ? 'rgba(255, 31, 109, 0.03)' : 'rgba(255, 31, 109, 0.05)');
      gradLeft.addColorStop(1, 'transparent');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, width, height);

      // Right Stage Spotlight (Acid Yellow)
      const gradRight = ctx.createRadialGradient(
        width * 0.8 + parallaxX * 0.5, 
        0, 
        10, 
        width * 0.75 + beamPhase2 * 300, 
        height * 0.8, 
        width * 0.65
      );
      gradRight.addColorStop(0, isLight ? 'rgba(238, 252, 84, 0.07)' : 'rgba(238, 252, 84, 0.12)');
      gradRight.addColorStop(0.5, isLight ? 'rgba(238, 252, 84, 0.02)' : 'rgba(238, 252, 84, 0.04)');
      gradRight.addColorStop(1, 'transparent');
      ctx.fillStyle = gradRight;
      ctx.fillRect(0, 0, width, height);

      // ─── 2. 3D Isometric Wave Floor (Perspective Concert Grid) ───
      const horizonY = height * 0.46 + parallaxY * 0.3;
      const fov = 420;
      const gridRows = 18;
      const gridCols = 24;
      const gridSpacingX = (width * 1.6) / gridCols;
      const gridDepthStart = 80;
      const gridDepthStep = 32;

      ctx.save();
      ctx.lineWidth = 1;

      // Lateral (horizontal perspective) undulating wave lines
      for (let r = 0; r < gridRows; r++) {
        const z = gridDepthStart + r * gridDepthStep;
        const progress = r / gridRows;
        const scaleZ = fov / (fov + z);
        const yBase = horizonY + (height * 0.65) * Math.pow(progress, 1.6);
        const waveAmp = (1 - progress * 0.4) * 9;

        const alpha = isLight 
          ? (0.02 + progress * 0.07) 
          : (0.03 + progress * 0.12);
        ctx.strokeStyle = isLight 
          ? `rgba(14, 14, 17, ${alpha})` 
          : `rgba(238, 252, 84, ${alpha})`;

        ctx.beginPath();
        for (let c = 0; c <= gridCols; c++) {
          const xWorld = (c - gridCols / 2) * gridSpacingX + parallaxX * (1 - progress);
          const xScreen = width / 2 + xWorld * scaleZ;
          const wave = Math.sin(c * 0.4 + time * 1.8 + r * 0.3) * waveAmp;
          const yScreen = yBase + wave;

          if (c === 0) ctx.moveTo(xScreen, yScreen);
          else ctx.lineTo(xScreen, yScreen);
        }
        ctx.stroke();
      }

      // Longitudinal (depth-projected) radiating grid lines
      for (let c = 0; c <= gridCols; c += 2) {
        ctx.strokeStyle = isLight 
          ? 'rgba(14, 14, 17, 0.04)' 
          : 'rgba(238, 252, 84, 0.06)';

        ctx.beginPath();
        const startX = width / 2 + (c - gridCols / 2) * gridSpacingX * (fov / (fov + gridDepthStart)) + parallaxX;
        ctx.moveTo(startX, horizonY);

        const endZ = gridDepthStart + (gridRows - 1) * gridDepthStep;
        const endProgress = 1;
        const endScale = fov / (fov + endZ);
        const endX = width / 2 + (c - gridCols / 2) * gridSpacingX * endScale;
        const endY = horizonY + (height * 0.65) * Math.pow(endProgress, 1.6);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      ctx.restore();

      // ─── 3. Floating 3D Wireframe Ticket & Polyhedra Nodes ───
      objects.forEach((obj) => {
        obj.rot[0] += obj.rotSpeed[0];
        obj.rot[1] += obj.rotSpeed[1];
        obj.rot[2] += obj.rotSpeed[2];

        const floatY = Math.sin(time * 1.5 + obj.floatPhase) * 16;
        const worldX = width / 2 + obj.pos[0] * width * 0.45 + parallaxX * 0.8;
        const worldY = height / 2 + obj.pos[1] * height * 0.45 + floatY + parallaxY * 0.8;
        const worldZ = obj.pos[2];

        // Project vertices with 3D rotation
        const projected = obj.vertices.map((v) => {
          let p = [v[0] * obj.scale, v[1] * obj.scale, v[2] * obj.scale];
          p = rotX(p, obj.rot[0]);
          p = rotY(p, obj.rot[1]);
          p = rotZ(p, obj.rot[2]);

          const pz = worldZ + p[2];
          const sc = fov / (fov + pz);
          return [worldX + p[0] * sc, worldY + p[1] * sc, pz];
        });

        // Draw Edges
        ctx.save();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = isLight ? (obj.color === '#EEFC54' ? '#d40c50' : '#1d4ed8') : obj.color;
        ctx.globalAlpha = isLight ? 0.35 : 0.42;

        obj.edges.forEach(([i, j]) => {
          const p1 = projected[i];
          const p2 = projected[j];
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        });

        // Draw Glowing Vertices
        projected.forEach(([x, y]) => {
          ctx.fillStyle = isLight ? '#0e0e11' : obj.accentColor;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      });

      // ─── 4. High-Altitude Floating Stage Strobe Dust ───
      particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z < 20) {
          p.z = 580;
          p.x = (Math.random() - 0.5) * 1200;
          p.y = (Math.random() - 0.5) * 900;
        }

        const sc = fov / (fov + p.z);
        const px = width / 2 + p.x * sc + parallaxX * 0.4;
        const py = height / 2 + p.y * sc + parallaxY * 0.4;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.save();
          ctx.fillStyle = isLight ? '#0e0e11' : p.color;
          ctx.globalAlpha = isLight ? 0.18 : 0.32 * sc;
          ctx.beginPath();
          ctx.arc(px, py, p.size * sc, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Dynamic 3D Matrix & Hologram Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />

      {/* Cyber-Zine Technical HUD Crosshairs & Telemetry Accents */}
      <div className="absolute top-16 left-6 text-[10px] font-ticker text-acid-yellow/30 uppercase tracking-widest hidden md:block">
        MATRIX://VOX.3D.HORIZON · STOMP CLUSTER ACTIVE
      </div>
      <div className="absolute top-16 right-6 text-[10px] font-ticker text-neon-magenta/30 uppercase tracking-widest hidden md:block text-right">
        ACOUSTIC SIGHTLINE DEPTH · 120dB STEREO RIG
      </div>

      <div className="absolute bottom-6 left-6 text-[10px] font-ticker text-grit-dim/30 uppercase tracking-widest hidden lg:block">
        [+] AXIS X: 00 · Y: 90 · Z: 360 · PERSPECTIVE FOV 420
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] font-ticker text-grit-dim/30 uppercase tracking-widest hidden lg:block text-right">
        [+] REAL-TIME 3D CONCERT STAGE DEPTH ENGINE
      </div>
    </div>
  );
}
