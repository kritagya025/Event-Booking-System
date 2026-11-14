import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, ArrowRight, Radio } from 'lucide-react';

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

  const handleFinish = useCallback(() => {
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
  }, [onComplete]);

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
  }, [handleFinish]);

  // Fast procedural boot counter: 0% -> 100% in ~1.9s
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1900;
    const totalLogs = logs.length;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      
      const stepped = Math.floor(ratio * 100);
      setProgress(stepped);

      const nextLog = Math.min(Math.floor(ratio * totalLogs), totalLogs - 1);
      setLogIndex(nextLog);

      if (ratio >= 1) {
        clearInterval(interval);
        setTimeout(handleFinish, 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [handleFinish, logs.length]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none bg-[#111111]">
      {/* Upper Shutter Half */}
      <div 
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#111111] border-b border-neutral-800 z-20 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="w-full bg-[#181818] py-2 px-4 border-b border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">EVENTHUB PLATFORM</span>
            <span>OFFICIAL BOX OFFICE DIRECT</span>
          </div>
        </div>

        {/* Top Registration Crosshairs */}
        <div className="p-4 sm:p-6 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0000ee]" />
            <span className="font-medium text-white">INITIALIZING LIVE ENVIRONMENT</span>
          </div>
          <button 
            type="button"
            onClick={handleFinish}
            className="bg-[#242424] hover:bg-neutral-700 text-white border border-neutral-700 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          >
            SKIP [ESC / SPACE] ↗
          </button>
        </div>

        {/* Middle Seam Guide */}
        <div className="px-4 sm:px-8 pb-2 flex justify-between text-[10px] text-neutral-500 uppercase">
          <span>PORTAL // ARCHIVE A</span>
          <span>FOH AUDIO LIVE</span>
        </div>
      </div>

      {/* Lower Shutter Half */}
      <div 
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#111111] border-t border-neutral-800 z-20 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Lower Seam Guide */}
        <div className="px-4 sm:px-8 pt-2 flex justify-between text-[10px] text-neutral-500 uppercase">
          <span>PORTAL // ARCHIVE B</span>
          <span>100% VERIFIED PASSES</span>
        </div>

        {/* Technical Readout at Bottom */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400 border-t border-neutral-800 bg-[#161616]">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#0000ee] animate-pulse" />
            <span className="text-white">
              {logs[logIndex]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#0000ee] font-medium">10-MIN HOLD ACTIVE</span>
            <span>BOX OFFICE DIRECT</span>
          </div>
        </div>

        <div className="h-2 w-full bg-[#181818]" />
      </div>

      {/* ─── CENTER HERO EMBLEM (Float Above Both Shutters) ─── */}
      <div 
        className={`absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none transition-all duration-400 ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="w-full max-w-lg bg-[#1a1a1a] rounded-[28px] border border-neutral-700 p-6 sm:p-10 shadow-2xl text-white relative pointer-events-auto">
          {/* Top Pill Badge */}
          <div className="absolute -top-3.5 right-6 bg-[#0000ee] text-white text-xs font-semibold px-4 py-1 rounded-full uppercase">
            BOX OFFICE // 2026
          </div>

          {/* Subtitle Protocol */}
          <div className="flex items-center gap-2 mb-2 text-xs text-[#0000ee] font-semibold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Official Live Event & Cinema Access</span>
          </div>

          {/* Brand Logo Title */}
          <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tight text-white leading-none uppercase mb-2 font-normal">
            EVENT<span className="text-[#0000ee]">HUB</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
            Reserved seating in real time with zero duplicate bookings. Cryptographic QR passes for arena concerts, IMAX laser screenings, and theater.
          </p>

          {/* Progress Bar Container */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-400 uppercase tracking-wider">SYSTEM INITIALIZATION</span>
              <span className="text-white text-base tabular-nums font-bold">{progress}%</span>
            </div>

            {/* Rounded Full Progress Track */}
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-white rounded-full transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs">
            <span className="text-[11px] text-neutral-400 uppercase hidden xs:inline">
              PRESS <kbd className="px-2 py-0.5 bg-neutral-800 rounded-md border border-neutral-700 text-white font-medium">SPACE</kbd> TO ENTER
            </span>
            <button 
              type="button"
              onClick={handleFinish}
              className="w-full xs:w-auto h-[48px] px-7 bg-white hover:bg-neutral-200 text-[#111111] font-medium text-xs uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto"
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
