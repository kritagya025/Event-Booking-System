import React, { useEffect, useState } from 'react';

export default function Background3D() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let animationFrame;
    let target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };
    let current = { x: target.x, y: target.y };

    const handleMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const updateLoop = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
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
      {/* ─── 1. Physical Cutting Mat & Soundboard Registration Grid ─── */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* ─── 2. Fine Acoustic Architecture Matrix & Stage Grid ─── */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '192px 192px'
        }}
      />

      {/* ─── 3. Interactive Stage Flashlight / Phosphor Spotlight Beam ─── */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(circle 480px at ${mousePos.x}px ${mousePos.y}px, rgba(238, 252, 84, 0.065), transparent 75%),
            radial-gradient(circle 700px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 31, 109, 0.035), transparent 85%)
          `
        }}
      />

      {/* ─── 4. Giant Watermarked Concert Pass & Archive Typography ─── */}
      {/* Center Diagonal Stamp Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="font-display text-[15vw] md:text-[13vw] font-black uppercase tracking-tighter text-transparent select-none whitespace-nowrap opacity-[0.025] dark:opacity-[0.035] rotate-[-12deg] pointer-events-none"
             style={{ WebkitTextStroke: '2px currentColor' }}>
          ADMIT ONE // CONCERT ARCHIVE // LIVE PROTOCOL
        </div>
      </div>

      {/* Background Concert Ticket Perforated Pass Silhouette */}
      <div className="absolute right-[4vw] top-[28vh] hidden lg:block opacity-[0.025] dark:opacity-[0.035] rotate-[6deg] pointer-events-none">
        <div className="w-[360px] h-[520px] border-4 border-dashed border-current p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start border-b-2 border-current pb-4">
            <div>
              <span className="font-impact text-3xl tracking-widest block">EVENT PASS</span>
              <span className="font-ticker text-xs">GATE 01 · PIT ACCESS</span>
            </div>
            <span className="font-ticker text-xs border border-current px-2 py-0.5 font-bold">VIP-A</span>
          </div>

          <div className="space-y-4 my-auto">
            <div className="h-6 w-full bg-current opacity-20" />
            <div className="h-2 w-3/4 bg-current opacity-20" />
            <div className="h-2 w-1/2 bg-current opacity-20" />
            <div className="flex gap-2">
              <div className="w-16 h-16 border-2 border-current flex items-center justify-center font-ticker text-xs font-bold">QR</div>
              <div className="flex-1 space-y-1">
                <div className="h-2 w-full bg-current opacity-20" />
                <div className="h-2 w-full bg-current opacity-20" />
                <div className="h-2 w-2/3 bg-current opacity-20" />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-current pt-4 flex justify-between items-end font-ticker text-xs">
            <span>STOMP://SEAT-LOCK.MUTEX</span>
            <span>#EH-2026-LIVE</span>
          </div>
        </div>
      </div>

      {/* Cassette Tape Twin Reel Silhouette Watermark on the Left */}
      <div className="absolute left-[3vw] bottom-[18vh] hidden xl:block opacity-[0.022] dark:opacity-[0.03] rotate-[-5deg] pointer-events-none">
        <div className="w-[320px] h-[190px] border-4 border-current p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between font-ticker text-[10px] tracking-wider uppercase border-b border-current pb-1">
            <span>VAULT://SIDE-A</span>
            <span>120 MIN · CH-01 STEREO</span>
          </div>
          <div className="flex items-center justify-center gap-12 my-auto">
            <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-current" />
            </div>
            <div className="h-8 w-24 border-2 border-current flex items-center justify-center font-ticker text-[9px] font-bold">
              TAPE 01
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-current" />
            </div>
          </div>
          <div className="font-ticker text-[8px] uppercase tracking-widest text-center">
            ACOUSTIC STAGE ARCHIVE // REAL-TIME CONCURRENCY
          </div>
        </div>
      </div>

      {/* ─── 5. Perimeter Decibel Meter & Soundboard Console Rulers ─── */}
      {/* Left Vertical Soundboard Decibel Ruler */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex-col items-center gap-3 hidden lg:flex opacity-25 font-ticker text-[8px]">
        <span className="text-neon-magenta font-bold">+12dB</span>
        <div className="h-14 w-[1px] bg-neon-magenta" />
        <span className="text-acid-yellow font-bold">0dB</span>
        <div className="h-20 w-[1px] bg-current" />
        <span>-12dB</span>
        <div className="h-14 w-[1px] bg-current" />
        <span>-36dB</span>
      </div>

      {/* Right Vertical Concert Barcode Strip */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex-col items-center gap-2 hidden lg:flex opacity-25 font-ticker text-[8px] text-right">
        <svg className="w-5 h-48 opacity-80" viewBox="0 0 20 180" fill="currentColor">
          <rect x="0" y="0" width="2" height="180"/>
          <rect x="4" y="0" width="1" height="180"/>
          <rect x="7" y="0" width="3" height="180"/>
          <rect x="12" y="0" width="1" height="180"/>
          <rect x="15" y="0" width="2" height="180"/>
          <rect x="19" y="0" width="1" height="180"/>
        </svg>
        <span className="writing-vertical text-[8px] tracking-widest uppercase opacity-75">
          #EH-8921-TICKET-PASS
        </span>
      </div>

      {/* ─── 6. Four Corner Silkscreen Registration Targets (⊕) ─── */}
      <div className="absolute top-14 left-6 hidden md:flex items-center gap-2 opacity-30 font-ticker text-[9px] uppercase tracking-widest">
        <span className="font-bold text-acid-yellow">⊕</span>
        <span>REG://GRID [X:00 Y:04] · 120dB SOUNDSTAGE</span>
      </div>

      <div className="absolute top-14 right-6 hidden md:flex items-center gap-2 opacity-30 font-ticker text-[9px] uppercase tracking-widest text-right">
        <span>STOMP CONCURRENCY MUTEX · 99.98% CLUSTER</span>
        <span className="font-bold text-neon-magenta">⊕</span>
      </div>

      <div className="absolute bottom-6 left-6 hidden xl:flex items-center gap-2 opacity-25 font-ticker text-[8px] uppercase tracking-wider">
        <span className="font-bold text-acid-yellow">⊕</span>
        <span>40Hz SUB-BASS FOH // ZERO DUPLICATE SEATS</span>
      </div>

      <div className="absolute bottom-6 right-6 hidden xl:flex items-center gap-2 opacity-25 font-ticker text-[8px] uppercase tracking-wider text-right">
        <span>VAULT://90s ACID-ZINE TAPE ARCHIVE</span>
        <span className="font-bold text-neon-magenta">⊕</span>
      </div>
    </div>
  );
}
