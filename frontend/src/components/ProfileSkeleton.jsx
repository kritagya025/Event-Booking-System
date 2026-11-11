import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="w-full space-y-8 select-none">
      {/* 1. Profile Header Box Skeleton */}
      <div className="bg-asphalt-surface border-2 border-asphalt-border p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_rgba(255,255,255,0.05)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 max-w-full">
            {/* Stamp Avatar Skeleton */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 skeleton-box border-2 border-asphalt-border shrink-0 shadow-[4px_4px_0px_#0e0e11]" />

            <div className="space-y-2 min-w-0 flex-1 max-w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-7 sm:h-8 w-40 sm:w-64 skeleton-box max-w-full" />
                <div className="h-5 w-20 skeleton-box border border-asphalt-border shrink-0" />
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 pt-1 min-w-0">
                <div className="h-3.5 w-36 sm:w-44 skeleton-box max-w-full" />
                <div className="h-3.5 w-28 sm:w-32 skeleton-box max-w-full" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="h-9 flex-1 sm:w-32 skeleton-box border border-asphalt-border" />
            <div className="h-9 flex-1 sm:w-28 skeleton-box border border-asphalt-border" />
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Skeleton (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-asphalt-surface border-2 border-asphalt-border p-4 shadow-[4px_4px_0px_rgba(255,255,255,0.05)] space-y-2"
          >
            <div className="h-3 w-28 skeleton-box" />
            <div className="h-8 w-28 skeleton-box" />
            <div className="h-2.5 w-36 skeleton-box opacity-60" />
          </div>
        ))}
      </div>

      {/* 3. Navigation Tabs & Content Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-asphalt-border pb-3">
          <div className="h-9 w-32 skeleton-box border border-asphalt-border" />
          <div className="h-9 w-32 skeleton-box border border-asphalt-border" />
          <div className="h-9 w-32 skeleton-box border border-asphalt-border" />
        </div>

        <div className="bg-asphalt-surface border-2 border-asphalt-border p-6 shadow-[4px_4px_0px_rgba(255,255,255,0.05)] space-y-4">
          <div className="h-6 w-48 skeleton-box mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-asphalt-card border border-asphalt-border p-4 h-20 skeleton-box"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

