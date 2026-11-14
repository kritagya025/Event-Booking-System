import React from 'react';

export default function ProfileSkeleton() {
  return (
    <div className="w-full space-y-8 select-none">
      {/* 1. Profile Header Card Skeleton */}
      <div className="bg-white rounded-[28px] border border-[#e5e7eb] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 max-w-full">
            {/* Avatar Skeleton */}
            <div className="w-20 h-20 rounded-full skeleton-box shrink-0" />

            <div className="space-y-2.5 min-w-0 flex-1 max-w-full">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-7 sm:h-8 w-48 rounded-md skeleton-box" />
                <div className="h-6 w-20 rounded-full skeleton-box shrink-0" />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <div className="h-4 w-40 rounded-full skeleton-box" />
                <div className="h-4 w-28 rounded-full skeleton-box" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="h-[44px] flex-1 sm:w-32 rounded-full skeleton-box" />
            <div className="h-[44px] flex-1 sm:w-28 rounded-full skeleton-box" />
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Skeleton (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm space-y-3"
          >
            <div className="h-3 w-28 rounded-full skeleton-box" />
            <div className="h-8 w-24 rounded-md skeleton-box" />
            <div className="h-3 w-32 rounded-full skeleton-box opacity-60" />
          </div>
        ))}
      </div>

      {/* 3. Navigation Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-[#f7f7f7] rounded-full max-w-fit">
          <div className="h-9 w-32 rounded-full skeleton-box" />
          <div className="h-9 w-28 rounded-full skeleton-box" />
        </div>
      </div>
    </div>
  );
}
