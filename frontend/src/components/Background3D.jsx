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

    // Mouse state with smooth spring physics
    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      vx: 0,
      vy: 0,
      radius: 140
    };

    // Acoustic impulses created on mouse interaction
    const impulses = [];

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      // Create subtle acoustic impulse when mouse moves briskly
      const dx = mouse.targetX - mouse.x;
      const dy = mouse.targetY - mouse.y;
      const speed = Math.hypot(dx, dy);

      if (speed > 18 && impulses.length < 8) {
        impulses.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: Math.min(width, height) * 0.42,
          strength: Math.min(speed * 0.04, 1.8),
          alpha: 0.6
        });
      }
    };

    const handleClick = (e) => {
      // Strong acoustic resonance shockwave on click
      impulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 15,
        maxRadius: Math.min(width, height) * 0.65,
        strength: 2.5,
        alpha: 0.9
      });
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', handleResize);

    // ─── Generative Acoustic Harmonic Waveform Ribbons ───
    // 3 distinct frequency bands: SUB-BASS (low), MID-RANGE (vocal/instruments), HIGH-FREQUENCY (air/strobe)
    const waveBands = [
      {
        baseY: 0.28,
        freq1: 0.0016,
        freq2: 0.0034,
        speed1: 0.7,
        speed2: 1.1,
        amp1: 38,
        amp2: 24,
        contours: 5,
        contourSpread: 7,
        colorDark: 'rgba(238, 252, 84, ', // Acid Yellow
        colorLight: 'rgba(212, 12, 80, ',
        baseAlpha: 0.09
      },
      {
        baseY: 0.58,
        freq1: 0.0022,
        freq2: 0.0048,
        speed1: 0.9,
        speed2: 1.4,
        amp1: 46,
        amp2: 28,
        contours: 6,
        contourSpread: 8,
        colorDark: 'rgba(255, 31, 109, ', // Neon Magenta
        colorLight: 'rgba(29, 78, 216, ',
        baseAlpha: 0.08
      },
      {
        baseY: 0.82,
        freq1: 0.0028,
        freq2: 0.0058,
        speed1: 1.2,
        speed2: 1.6,
        amp1: 34,
        amp2: 20,
        contours: 4,
        contourSpread: 6,
        colorDark: 'rgba(29, 78, 216, ', // Electric Cobalt
        colorLight: 'rgba(14, 14, 17, ',
        baseAlpha: 0.06
      }
    ];

    // Floating Acoustic Nodes (Chladni dust points that drift along waveform currents)
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      bandIndex: Math.floor(Math.random() * waveBands.length),
      offsetY: (Math.random() - 0.5) * 60,
      speedX: Math.random() * 0.45 + 0.2,
      radius: Math.random() * 1.8 + 1.0,
      glow: Math.random() > 0.6,
      alpha: Math.random() * 0.4 + 0.2
    }));

    let time = 0;

    // ─── Render Loop ───
    const render = () => {
      time += 0.014;

      // Mouse spring dampening
      mouse.vx = (mouse.targetX - mouse.x) * 0.05;
      mouse.vy = (mouse.targetY - mouse.y) * 0.05;
      mouse.x += mouse.vx;
      mouse.y += mouse.vy;

      const isLight = document.documentElement.classList.contains('light');

      ctx.clearRect(0, 0, width, height);

      // ─── 1. Ambient Volumetric Stage Caustics ───
      // Dual soft color blooms that breathe slowly
      const bloomX1 = width * 0.2 + Math.sin(time * 0.5) * 80;
      const bloomY1 = height * 0.3 + Math.cos(time * 0.4) * 60;
      const rad1 = ctx.createRadialGradient(bloomX1, bloomY1, 20, bloomX1, bloomY1, width * 0.5);
      rad1.addColorStop(0, isLight ? 'rgba(255, 31, 109, 0.05)' : 'rgba(255, 31, 109, 0.10)');
      rad1.addColorStop(1, 'transparent');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const bloomX2 = width * 0.8 + Math.cos(time * 0.45) * 80;
      const bloomY2 = height * 0.7 + Math.sin(time * 0.55) * 60;
      const rad2 = ctx.createRadialGradient(bloomX2, bloomY2, 20, bloomX2, bloomY2, width * 0.5);
      rad2.addColorStop(0, isLight ? 'rgba(238, 252, 84, 0.04)' : 'rgba(238, 252, 84, 0.08)');
      rad2.addColorStop(1, 'transparent');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);

      // ─── 2. Update and Draw Acoustic Shockwave Impulses ───
      for (let i = impulses.length - 1; i >= 0; i--) {
        const imp = impulses[i];
        imp.radius += (imp.maxRadius - imp.radius) * 0.04;
        imp.alpha *= 0.96;

        if (imp.alpha > 0.02) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(imp.x, imp.y, imp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = isLight 
            ? `rgba(212, 12, 80, ${imp.alpha * 0.35})` 
            : `rgba(238, 252, 84, ${imp.alpha * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();

          // Outer secondary echo ring
          if (imp.radius > 40) {
            ctx.beginPath();
            ctx.arc(imp.x, imp.y, imp.radius * 0.72, 0, Math.PI * 2);
            ctx.strokeStyle = isLight 
              ? `rgba(14, 14, 17, ${imp.alpha * 0.15})` 
              : `rgba(255, 31, 109, ${imp.alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }

        if (imp.alpha <= 0.02 || imp.radius >= imp.maxRadius * 0.98) {
          impulses.splice(i, 1);
        }
      }

      // ─── 3. Generative Acoustic Frequency Wave Ribbons ───
      const stepX = 14; // Horizontal sampling resolution

      waveBands.forEach((band) => {
        const centerBaseY = height * band.baseY;
        const colorPrefix = isLight ? band.colorLight : band.colorDark;

        // Draw multiple parallel topographical sound wave contours
        for (let c = 0; c < band.contours; c++) {
          const contourOffset = (c - (band.contours - 1) / 2) * band.contourSpread;
          const alphaFade = 1 - Math.abs(c - (band.contours - 1) / 2) / (band.contours * 0.65);
          const contourAlpha = band.baseAlpha * alphaFade;

          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = `${colorPrefix}${contourAlpha})`;
          ctx.lineWidth = c === Math.floor(band.contours / 2) ? 1.6 : 1.0;

          // Subtle dash on outer boundary contours for architectural look
          if (c === 0 || c === band.contours - 1) {
            ctx.setLineDash([4, 6]);
          }

          let first = true;
          for (let x = -20; x <= width + 20; x += stepX) {
            // Harmonic wave equations
            const wave1 = Math.sin(x * band.freq1 + time * band.speed1) * band.amp1;
            const wave2 = Math.cos(x * band.freq2 - time * band.speed2) * band.amp2;
            const microChladni = Math.sin((x + contourOffset * 4) * 0.008 + time * 2) * 5;

            // Interactive Mouse Acoustic Warp
            const distMouse = Math.hypot(x - mouse.x, centerBaseY - mouse.y);
            let mouseWarp = 0;
            if (distMouse < mouse.radius * 2) {
              const factor = (1 - distMouse / (mouse.radius * 2));
              mouseWarp = Math.sin(distMouse * 0.03 - time * 3) * factor * 26;
            }

            // Impulse distortion
            let impulseWarp = 0;
            for (let k = 0; k < impulses.length; k++) {
              const imp = impulses[k];
              const dImp = Math.hypot(x - imp.x, centerBaseY - imp.y);
              const ringDist = Math.abs(dImp - imp.radius);
              if (ringDist < 50) {
                const ringFactor = (1 - ringDist / 50) * imp.alpha;
                impulseWarp += Math.sin(ringDist * 0.08) * ringFactor * 18 * imp.strength;
              }
            }

            const y = centerBaseY + contourOffset + wave1 + wave2 + microChladni + mouseWarp + impulseWarp;

            if (first) {
              ctx.moveTo(x, y);
              first = false;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }

        // Accent Node Markers along the center contour
        const markerStep = width / 6;
        for (let m = markerStep * 0.5; m < width; m += markerStep) {
          const wave1 = Math.sin(m * band.freq1 + time * band.speed1) * band.amp1;
          const wave2 = Math.cos(m * band.freq2 - time * band.speed2) * band.amp2;
          const nodeY = centerBaseY + wave1 + wave2;

          ctx.save();
          ctx.fillStyle = isLight ? 'rgba(14, 14, 17, 0.25)' : `${colorPrefix}0.45)`;
          ctx.beginPath();
          ctx.arc(m, nodeY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Small acoustic frequency crosshair (+)
          ctx.strokeStyle = isLight ? 'rgba(14, 14, 17, 0.15)' : `${colorPrefix}0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(m - 4, nodeY);
          ctx.lineTo(m + 4, nodeY);
          ctx.moveTo(m, nodeY - 4);
          ctx.lineTo(m, nodeY + 4);
          ctx.stroke();
          ctx.restore();
        }
      });

      // ─── 4. Floating Acoustic Particles (Chladni Current) ───
      nodes.forEach((node) => {
        node.x += node.speedX;
        if (node.x > width + 20) {
          node.x = -20;
          node.offsetY = (Math.random() - 0.5) * 60;
        }

        const band = waveBands[node.bandIndex];
        const centerBaseY = height * band.baseY;
        const wave1 = Math.sin(node.x * band.freq1 + time * band.speed1) * band.amp1;
        const wave2 = Math.cos(node.x * band.freq2 - time * band.speed2) * band.amp2;
        const py = centerBaseY + node.offsetY + wave1 + wave2;

        ctx.save();
        const pColor = isLight ? 'rgba(14, 14, 17, ' : (node.bandIndex === 0 ? 'rgba(238, 252, 84, ' : 'rgba(255, 31, 109, ');
        ctx.fillStyle = `${pColor}${node.alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, py, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* ─── Generative Acoustic Canvas ─── */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />

      {/* ─── Architectural Concert Telemetry Perimeter (Left Vertical Meter) ─── */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex-col items-center gap-2 hidden lg:flex opacity-25 font-ticker text-[8px] text-grit-dim">
        <span>+12dB</span>
        <div className="h-24 w-[1px] bg-gradient-to-b from-neon-magenta via-acid-yellow to-asphalt-border" />
        <span className="text-acid-yellow font-bold">0dB</span>
        <div className="h-24 w-[1px] bg-asphalt-border" />
        <span>-36dB</span>
      </div>

      {/* ─── Right Vertical Frequency Meter ─── */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex-col items-center gap-2 hidden lg:flex opacity-25 font-ticker text-[8px] text-grit-dim text-right">
        <span>16kHz</span>
        <div className="h-20 w-[1px] bg-asphalt-border" />
        <span className="text-neon-magenta font-bold">1kHz</span>
        <div className="h-20 w-[1px] bg-asphalt-border" />
        <span>40Hz</span>
      </div>

      {/* ─── Top Left System Protocol Stamp ─── */}
      <div className="absolute top-14 left-6 hidden md:flex items-center gap-2 opacity-30 font-ticker text-[9px] uppercase tracking-widest text-grit-dim">
        <span className="w-1.5 h-1.5 bg-acid-yellow animate-ping" />
        <span>ACOUSTIC RESONANCE ENGINE // 3-BAND FREQUENCY HARMONICS</span>
      </div>

      {/* ─── Top Right Telemetry Stamp ─── */}
      <div className="absolute top-14 right-6 hidden md:flex items-center gap-2 opacity-30 font-ticker text-[9px] uppercase tracking-widest text-grit-dim text-right">
        <span>STOMP CONCURRENCY MUTEX · 99.98% CLUSTER SYNC</span>
      </div>

      {/* ─── Bottom Sub-Bass & Coordinate Bar ─── */}
      <div className="absolute bottom-4 inset-x-8 hidden xl:flex items-center justify-between opacity-20 font-ticker text-[8px] uppercase tracking-wider text-grit-dim border-t border-dashed border-asphalt-border pt-1.5">
        <span>SUB-BASS HARMONIC SPECTRUM: 40Hz · 120dB STEREO FOH RIG</span>
        <span>INTERACTIVE IMPULSE PHYSICS: HOVER OR CLICK TO DISPERSE ACOUSTIC WAVE</span>
        <span>VAULT://90s TAPE ARCHIVE PROTOCOL</span>
      </div>
    </div>
  );
}
