import React from 'react';

export default function AdminDashboardSkeleton() {
  return (
    <div className="w-full space-y-8 select-none">
      {/* 4 Brutalist Metric Stamps Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-asphalt-surface border-2 border-asphalt-border p-5 shadow-[3px_3px_0px_rgba(255,255,255,0.05)] relative space-y-2.5"
          >
            <div className="h-3 w-28 skeleton-box" />
            <div className="h-9 w-36 skeleton-box" />
            <div className="h-2.5 w-32 skeleton-box opacity-60" />
          </div>
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Popular Events Skeleton */}
        <div className="bg-asphalt-surface border-2 border-asphalt-border p-6 shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
          <div className="h-6 w-52 skeleton-box mb-5" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-asphalt-card border-2 border-asphalt-border p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 skeleton-box shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 sm:w-56 skeleton-box" />
                    <div className="h-2.5 w-28 skeleton-box" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 skeleton-box" />
                  <div className="h-7 w-7 skeleton-box" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Infrastructure State Skeleton */}
        <div className="bg-asphalt-surface border-2 border-asphalt-border p-6 shadow-[3px_3px_0px_rgba(255,255,255,0.05)]">
          <div className="h-6 w-64 skeleton-box mb-5" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-asphalt-card border border-asphalt-border p-3.5 flex justify-between items-center"
              >
                <div className="h-3.5 w-40 skeleton-box" />
                <div className="h-6 w-32 skeleton-box" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

