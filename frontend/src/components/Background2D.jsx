import React from 'react';

export default function Background2D() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* ─── 1. Swiss 12-Column Typographic Crosshair Grid (Pure Flat 2D Architectural Registration) ─── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="swiss-crosshairs-2d" width="96" height="96" patternUnits="userSpaceOnUse">
            <line x1="48" y1="42" x2="48" y2="54" stroke="currentColor" strokeWidth="1.5" />
            <line x1="42" y1="48" x2="54" y2="48" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#swiss-crosshairs-2d)" />
      </svg>

      {/* ─── 2. Giant Watermarked Concert Pass & Archive Typography (Strictly 2D Orthogonal Alignment) ─── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div 
          className="font-display text-[14vw] md:text-[12vw] font-black uppercase tracking-tighter text-transparent select-none whitespace-nowrap opacity-[0.025] dark:opacity-[0.035] pointer-events-none"
          style={{ WebkitTextStroke: '2px currentColor' }}
        >
          ADMIT ONE // CONCERT ARCHIVE // 2D PROTOCOL
        </div>
      </div>

      {/* ─── 3. Background Concert Ticket Perforated Pass Silhouette (Pure Flat 2D, 0deg Angle) ─── */}
      <div className="absolute right-[4vw] top-[26vh] hidden lg:block opacity-[0.03] dark:opacity-[0.045] pointer-events-none">
        <div className="w-[360px] h-[500px] border-4 border-dashed border-current p-6 flex flex-col justify-between">
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
            <span>EVENTHUB // BOX OFFICE DIRECT</span>
            <span>#EH-2026-LIVE</span>
          </div>
        </div>
      </div>

      {/* ─── 4. Cassette Tape Twin Reel Silhouette Watermark (Pure Flat 2D Orthogonal) ─── */}
      <div className="absolute left-[3vw] bottom-[16vh] hidden xl:block opacity-[0.025] dark:opacity-[0.035] pointer-events-none">
        <div className="w-[320px] h-[190px] border-4 border-current p-4 rounded-none flex flex-col justify-between">
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
            CONCERT & CINEMA SEAT PASS // EVENTHUB
          </div>
        </div>
      </div>

      {/* ─── 5. Perimeter Decibel Meter & Soundboard Console Rulers ─── */}
      {/* Left Vertical Soundboard Decibel Ruler */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex-col items-center gap-3 hidden lg:flex opacity-30 font-ticker text-[8px]">
        <span className="text-neon-magenta font-bold">+12dB</span>
        <div className="h-14 w-[2px] bg-neon-magenta" />
        <span className="text-acid-yellow font-bold">0dB</span>
        <div className="h-20 w-[2px] bg-current" />
        <span>-12dB</span>
        <div className="h-14 w-[1px] bg-current" />
        <span>-36dB</span>
      </div>

      {/* Right Vertical Concert Barcode Strip */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex-col items-center gap-2 hidden lg:flex opacity-30 font-ticker text-[8px] text-right">
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
      <div className="absolute top-14 left-6 hidden md:flex items-center gap-2 opacity-35 font-ticker text-[9px] uppercase tracking-widest">
        <span className="font-bold text-acid-yellow">⊕</span>
        <span>REG://GRID [2D.NEOBRUTAL] · 120dB SOUNDSTAGE</span>
      </div>

      <div className="absolute top-14 right-6 hidden md:flex items-center gap-2 opacity-35 font-ticker text-[9px] uppercase tracking-widest text-right">
        <span>LIVE BOX OFFICE · 100% VERIFIED PASSES</span>
        <span className="font-bold text-neon-magenta">⊕</span>
      </div>

      <div className="absolute bottom-6 left-6 hidden xl:flex items-center gap-2 opacity-30 font-ticker text-[8px] uppercase tracking-wider">
        <span className="font-bold text-acid-yellow">⊕</span>
        <span>40Hz SUB-BASS FOH // ZERO DUPLICATE SEATS</span>
      </div>

      <div className="absolute bottom-6 right-6 hidden xl:flex items-center gap-2 opacity-30 font-ticker text-[8px] uppercase tracking-wider text-right">
        <span>VAULT://90s ACID-ZINE TAPE ARCHIVE</span>
        <span className="font-bold text-neon-magenta">⊕</span>
      </div>
    </div>
  );
}

