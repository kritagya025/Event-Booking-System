import React, { useState, useEffect, useRef } from 'react';
import { Zap, ShieldCheck, Ticket, ArrowRight, Radio } from 'lucide-react';

export default function IntroSplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = useRef(false);

  const logs = [
    'CONNECTING TO EVENTHUB BOX OFFICE DIRECT...',
    'SYNCING REAL-TIME AUDITORIUM SEATING MAPS...',
    'INITIALIZING 10-MINUTE RESERVED CART HOLD...',
    'VERIFYING CRYPTOGRAPHIC QR GATE CODES...',
    'SYSTEM READY. ENJOY THE EXPERIENCE.'
  ];

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsExiting(true);

    try {
      localStorage.setItem('eventhub_visited', 'true');
    } catch {
      // Ignore storage errors in private browsing
    }

    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  // Keyboard shortcut: Space or Enter to skip immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fast procedural boot counter: 0% -> 100% in ~1.9s
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1900;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      
      // Snappy non-linear step curve
      const stepped = Math.floor(ratio * 100);
      setProgress(stepped);

      const nextLog = Math.min(Math.floor(ratio * logs.length), logs.length - 1);
      setLogIndex(nextLog);

      if (ratio >= 1) {
        clearInterval(interval);
        setTimeout(handleFinish, 300);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden" 
      aria-label="Welcome to EventHub"
      role="dialog"
      aria-modal="true"
    >
      {/* ─── SPLIT MECHANICAL SHUTTERS (Slide Apart on Exit) ─── */}
      
      {/* Upper Shutter Half */}
      <div 
        className={`absolute inset-x-0 top-0 h-1/2 bg-asphalt-black border-b-4 border-grit-white z-20 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Top Hazard Warning Tape */}
        <div className="h-7 w-full hazard-tape border-b-2 border-asphalt-black overflow-hidden flex items-center px-4">
          <div className="animate-marquee font-ticker text-[11px] font-extrabold uppercase tracking-widest text-asphalt-black">
            <span>[ SYSTEM://BOOT ] OFFICIAL BOX OFFICE PROTOCOL · REAL-TIME SEAT CONCURRENCY · TAMPER-PROOF QR TICKETS · </span>
            <span>[ SYSTEM://BOOT ] OFFICIAL BOX OFFICE PROTOCOL · REAL-TIME SEAT CONCURRENCY · TAMPER-PROOF QR TICKETS · </span>
          </div>
        </div>

        {/* Top Registration Crosshairs */}
        <div className="p-4 sm:p-6 flex items-center justify-between font-ticker text-[10px] text-grit-dim uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-acid-yellow font-bold text-sm">⊕</span>
            <span>REG://BOOT [2D.SYSTEM]</span>
          </div>
          <button 
            type="button"
            onClick={handleFinish}
            className="bg-asphalt-surface hover:bg-acid-yellow hover:text-asphalt-black text-grit-white border-2 border-grit-white px-3 py-1 font-impact text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_#0e0e11] cursor-pointer"
          >
            SKIP [ESC / SPACE] ↗
          </button>
        </div>

        {/* Middle Seam Guide */}
        <div className="px-4 sm:px-8 pb-1 flex justify-between font-ticker text-[8px] text-grit-dim uppercase opacity-60">
          <span>PORTAL // ARCHIVE SPLIT-A</span>
          <span>CH-01 FOH AUDIO</span>
        </div>
      </div>

      {/* Lower Shutter Half */}
      <div 
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-asphalt-black border-t-4 border-grit-white z-20 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Lower Seam Guide */}
        <div className="px-4 sm:px-8 pt-1 flex justify-between font-ticker text-[8px] text-grit-dim uppercase opacity-60">
          <span>PORTAL // ARCHIVE SPLIT-B</span>
          <span>100% VERIFIED PASSES</span>
        </div>

        {/* Technical Terminal Readout at Bottom */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-ticker text-[10px] text-grit-dim uppercase border-t border-asphalt-border bg-asphalt-surface/60">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-neon-magenta animate-pulse" />
            <span className="text-grit-white font-mono-zine">
              {logs[logIndex]}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-acid-yellow font-bold">10-MIN HOLD ACTIVE</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neon-magenta font-bold text-sm">⊕</span>
              <span>BOX OFFICE DIRECT</span>
            </div>
          </div>
        </div>

        {/* Bottom Hazard Warning Tape */}
        <div className="h-7 w-full hazard-tape-magenta border-t-2 border-asphalt-black overflow-hidden flex items-center px-4">
          <div className="animate-marquee font-ticker text-[11px] font-extrabold uppercase tracking-widest text-grit-white">
            <span>LIVE CONCERTS · IMAX 3D CINEMA · ARENA TOURS · BROADWAY THEATER · ESPORTS CHAMPIONSHIPS · </span>
            <span>LIVE CONCERTS · IMAX 3D CINEMA · ARENA TOURS · BROADWAY THEATER · ESPORTS CHAMPIONSHIPS · </span>
          </div>
        </div>
      </div>

      {/* ─── CENTER HERO EMBLEM (Float Above Both Shutters) ─── */}
      <div 
        className={`absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none transition-all duration-400 ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="w-full max-w-lg bg-asphalt-card border-4 border-grit-white p-5 sm:p-8 shadow-[8px_8px_0px_#eefc54] text-grit-white relative pointer-events-auto">
          {/* Top Tape Stamp */}
          <div className="absolute -top-4 right-4 bg-neon-magenta text-grit-white font-impact text-xs sm:text-sm tracking-widest px-3 py-1 border-2 border-asphalt-black shadow-[3px_3px_0px_#0e0e11] uppercase font-bold">
            BOX OFFICE DIRECT // 2026
          </div>

          {/* Subtitle Protocol */}
          <div className="flex items-center gap-2 mb-2 font-ticker text-[10px] sm:text-xs text-acid-yellow font-bold uppercase tracking-wider">
            <ShieldCheck size={14} className="text-acid-yellow" />
            <span>OFFICIAL LIVE EVENT & CINEMA ACCESS</span>
          </div>

          {/* Brand Logo Title */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-grit-white leading-none uppercase mb-2">
            EVENT<span className="text-acid-yellow underline decoration-neon-magenta decoration-4">HUB</span>
          </h1>

          <p className="font-mono-zine text-xs sm:text-sm text-grit-dim mb-5 leading-relaxed">
            Reserved seating in real time with zero duplicate bookings. Cryptographic QR passes for arena concerts, IMAX laser screenings, and theater.
          </p>

          {/* Progress Bar Container */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between items-center font-ticker text-xs font-bold">
              <span className="text-grit-dim uppercase tracking-wider">SYSTEM INITIALIZATION</span>
              <span className="text-acid-yellow font-mono-zine text-base tabular-nums font-black">{progress}%</span>
            </div>

            {/* Flat 2D Neo-Brutalist Progress Track */}
            <div className="w-full h-4 sm:h-5 bg-asphalt-black border-2 border-grit-white p-0.5 relative overflow-hidden">
              <div 
                className="h-full bg-acid-yellow transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-asphalt-border font-ticker text-xs">
            <span className="text-[10px] text-grit-dim uppercase hidden xs:inline">
              PRESS <kbd className="px-1.5 py-0.5 bg-asphalt-black border border-asphalt-border text-grit-white font-bold">SPACE</kbd> TO ENTER
            </span>
            <button 
              type="button"
              onClick={handleFinish}
              className="w-full xs:w-auto px-5 py-2.5 bg-acid-yellow hover:bg-neon-magenta text-asphalt-black hover:text-grit-white font-impact text-sm sm:text-base uppercase tracking-wider border-2 border-asphalt-black shadow-[3px_3px_0px_#ffffff] transition-all flex items-center justify-center gap-2 font-bold cursor-pointer ml-auto"
            >
              <span>ENTER EVENTHUB</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
