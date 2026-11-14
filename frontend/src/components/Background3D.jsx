import React, { useEffect, useState } from 'react';

export default function Background3D() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let animationFrame;
    let target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
    let current = { x: target.x, y: target.y };

    const handleMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const updateLoop = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      setMousePos({ x: Math.round(current.x), y: Math.round(current.y) });
      animationFrame = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrame = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* ─── 1. Subtle High-Resolution Ambient Spotlight Following Cursor ─── */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `
            radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(0, 0, 238, 0.045), transparent 70%),
            radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.015), transparent 85%)
          `
        }}
      />

      {/* ─── 2. Fixed Hero Atmospheric Ambient Glows ─── */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#0000ee]/10 via-[#0000ee]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* ─── 3. Minimal Precision Grid Pattern (EventHub Subdued Grid) ─── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="eventhub-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <line x1="64" y1="0" x2="64" y2="64" stroke="#ffffff" strokeWidth="1" />
            <line x1="0" y1="64" x2="64" y2="64" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#eventhub-grid)" />
      </svg>
    </div>
  );
}
