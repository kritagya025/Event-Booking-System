import React from 'react';

export default function SeatMapSkeleton({ isCinema = false }) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const leftSeats = [1, 2, 3, 4, 5];
  const rightSeats = [6, 7, 8, 9, 10];

  return (
    <div className="w-full select-none py-2 space-y-6">
      {/* 1. Curved Screen / Proscenium Skeleton */}
      <div className="relative bg-asphalt-black border-2 border-asphalt-border p-4 overflow-hidden">
        <div className="hazard-tape h-2 w-full mb-3" />
        <div className={`h-16 w-full skeleton-box border-2 border-asphalt-border ${isCinema ? 'rounded-b-[40px]' : 'rounded-b-[20px]'} flex flex-col items-center justify-center px-4`}>
          <div className="h-4 w-64 skeleton-box mb-1.5" />
          <div className="h-2.5 w-48 skeleton-box opacity-60" />
        </div>
      </div>

      {/* 2. Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-asphalt-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 skeleton-box" />
          <div className="h-6 w-24 skeleton-box" />
          <div className="h-6 w-20 skeleton-box" />
          <div className="h-6 w-20 skeleton-box" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 skeleton-box" />
          <div className="h-6 w-16 skeleton-box" />
        </div>
      </div>

      {/* 3. Seat Grid Skeleton */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[560px] flex flex-col gap-3 items-center">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              {/* Row Label Left */}
              <div className="w-6 h-7 skeleton-box font-ticker text-xs font-bold flex items-center justify-center border border-asphalt-border text-grit-dim">
                {row}
              </div>

              {/* Left Wing (5 Seats) */}
              <div className="flex items-center gap-1.5">
                {leftSeats.map((s) => (
                  <div
                    key={`l-${s}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 skeleton-box border border-asphalt-border rounded-[3px]"
                  />
                ))}
              </div>

              {/* Aisle */}
              <div className="w-6 sm:w-8 text-center text-grit-dim font-ticker text-[9px] tracking-widest opacity-40">
                AISLE
              </div>

              {/* Right Wing (5 Seats) */}
              <div className="flex items-center gap-1.5">
                {rightSeats.map((s) => (
                  <div
                    key={`r-${s}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 skeleton-box border border-asphalt-border rounded-[3px]"
                  />
                ))}
              </div>

              {/* Row Label Right */}
              <div className="w-6 h-7 skeleton-box font-ticker text-xs font-bold flex items-center justify-center border border-asphalt-border text-grit-dim">
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Legend Skeleton */}
      <div className="pt-4 border-t border-asphalt-border flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 skeleton-box border border-asphalt-border rounded-[2px]" />
            <div className="h-3 w-16 skeleton-box" />
          </div>
        ))}
      </div>

      {/* 5. Calibrating Status Text */}
      <div className="text-center pt-2">
        <span className="font-mono-zine text-xs text-acid-yellow uppercase tracking-widest animate-pulse">
          CALIBRATING VENUE ACOUSTICS & SEAT INVENTORY...
        </span>
      </div>
    </div>
  );
}

