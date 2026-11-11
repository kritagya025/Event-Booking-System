import React from 'react';

export default function AdminDashboardSkeleton() {
  return (
    <div className="w-full space-y-8 select-none">
      {/* 4 Brutalist Metric Stamps Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-0 bg-asphalt-surface border-2 border-asphalt-border p-3 sm:p-5 shadow-[3px_3px_0px_rgba(255,255,255,0.05)] relative space-y-2.5"
          >
            <div className="h-3 w-20 sm:w-28 max-w-full skeleton-box" />
            <div className="h-7 sm:h-9 w-24 sm:w-36 max-w-full skeleton-box" />
            <div className="h-2.5 w-20 sm:w-32 max-w-full skeleton-box opacity-60" />
          </div>
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel: Popular Events Skeleton */}
        <div className="min-w-0 bg-asphalt-surface border-2 border-asphalt-border p-3.5 sm:p-6 shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
          <div className="h-6 w-36 sm:w-52 max-w-full skeleton-box mb-4 sm:mb-5" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-asphalt-card border-2 border-asphalt-border p-3 sm:p-3.5 flex items-center justify-between min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 skeleton-box shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="h-4 w-28 sm:w-56 max-w-full skeleton-box" />
                    <div className="h-2.5 w-20 sm:w-28 max-w-full skeleton-box" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-2">
                  <div className="h-5 sm:h-6 w-12 sm:w-16 skeleton-box" />
                  <div className="h-6 sm:h-7 w-6 sm:w-7 skeleton-box" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Infrastructure State Skeleton */}
        <div className="min-w-0 bg-asphalt-surface border-2 border-asphalt-border p-3.5 sm:p-6 shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
          <div className="h-6 w-40 sm:w-64 max-w-full skeleton-box mb-4 sm:mb-5" />
          <div className="space-y-2.5 sm:space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-asphalt-card border border-asphalt-border p-2.5 sm:p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 sm:gap-2 min-w-0"
              >
                <div className="h-3.5 w-28 sm:w-40 max-w-full skeleton-box" />
                <div className="h-5 sm:h-6 w-24 sm:w-32 max-w-full skeleton-box" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

