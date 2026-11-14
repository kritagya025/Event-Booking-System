import React from 'react';

export default function SeatMapSkeleton({ isCinema = false }) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const leftSeats = [1, 2, 3, 4, 5];
  const rightSeats = [6, 7, 8, 9, 10];

  return (
    <div className="w-full select-none py-2 space-y-6">
      {/* 1. Curved Screen / Stage Skeleton */}
      <div className="relative bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl p-6 flex flex-col items-center justify-center">
        <div className={`h-12 w-full max-w-md skeleton-box ${isCinema ? 'rounded-full' : 'rounded-full'} flex flex-col items-center justify-center px-4`}>
          <div className="h-3 w-48 rounded-full skeleton-box mb-1.5 opacity-60" />
        </div>
      </div>

      {/* 2. Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-full skeleton-box" />
          <div className="h-8 w-24 rounded-full skeleton-box" />
          <div className="h-8 w-20 rounded-full skeleton-box" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-full skeleton-box" />
          <div className="h-8 w-16 rounded-full skeleton-box" />
        </div>
      </div>

      {/* 3. Seat Grid Skeleton */}
      <div className="overflow-x-auto pb-4 touch-scroll scrollbar-none">
        <div className="min-w-fit w-full flex flex-col gap-2.5 items-center">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              {/* Row Label Left */}
              <div className="w-6 h-8 rounded-md skeleton-box font-sans text-xs font-bold flex items-center justify-center text-[#6b7280]">
                {row}
              </div>

              {/* Left Wing (5 Seats) */}
              <div className="flex items-center gap-1.5">
                {leftSeats.map((s) => (
                  <div
                    key={`l-${s}`}
                    className="w-8 h-8 rounded-lg skeleton-box"
                  />
                ))}
              </div>

              {/* Aisle */}
              <div className="w-8 text-center text-[#9ca3af] text-[9px] tracking-widest font-semibold">
                AISLE
              </div>

              {/* Right Wing (5 Seats) */}
              <div className="flex items-center gap-1.5">
                {rightSeats.map((s) => (
                  <div
                    key={`r-${s}`}
                    className="w-8 h-8 rounded-lg skeleton-box"
                  />
                ))}
              </div>

              {/* Row Label Right */}
              <div className="w-6 h-8 rounded-md skeleton-box font-sans text-xs font-bold flex items-center justify-center text-[#6b7280]">
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Telemetry Bar Skeleton */}
      <div className="h-12 w-full rounded-2xl skeleton-box" />
    </div>
  );
}
