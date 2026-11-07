import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-asphalt-card border-2 border-asphalt-border relative flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
      {/* 1. Artwork / Poster Skeleton */}
      <div className="relative h-56 w-full skeleton-box border-b-2 border-asphalt-border">
        {/* Top Badges Placeholder */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="h-5 w-20 bg-asphalt-surface/80 border border-asphalt-border" />
          <div className="h-6 w-6 bg-asphalt-surface/80 border border-asphalt-border" />
        </div>

        {/* Date Pill Placeholder */}
        <div className="absolute bottom-2.5 left-2.5 h-6 w-36 bg-asphalt-surface/90 border border-asphalt-border" />
      </div>

      {/* 2. Content Body Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Cinema tags row */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-4 w-14 skeleton-box border border-asphalt-border" />
            <div className="h-4 w-12 skeleton-box border border-asphalt-border" />
            <div className="h-4 w-12 skeleton-box border border-asphalt-border" />
          </div>

          {/* Event Title Skeleton */}
          <div className="space-y-1.5">
            <div className="h-6 w-11/12 skeleton-box" />
            <div className="h-6 w-3/5 skeleton-box" />
          </div>

          {/* Venue & Location Skeleton */}
          <div className="h-3.5 w-48 skeleton-box mt-2" />
        </div>

        <div>
          {/* Showtimes row skeleton */}
          <div className="mb-3.5 pt-2.5 border-t border-asphalt-border space-y-1.5">
            <div className="h-2.5 w-28 skeleton-box" />
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map(t => (
                <div key={t} className="h-6 skeleton-box border border-asphalt-border" />
              ))}
            </div>
          </div>

          {/* Price & Seat Box Skeleton */}
          <div className="bg-asphalt-surface p-2.5 border border-asphalt-border mb-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-2.5 w-16 skeleton-box" />
              <div className="h-6 w-20 skeleton-box" />
            </div>
            <div className="space-y-1 flex flex-col items-end">
              <div className="h-2.5 w-10 skeleton-box" />
              <div className="h-4 w-16 skeleton-box" />
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="h-11 w-full skeleton-box border-2 border-asphalt-border shadow-[3px_3px_0px_rgba(255,255,255,0.05)]" />
        </div>
      </div>
    </div>
  );
}
