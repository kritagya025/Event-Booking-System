import React from 'react';

export default function AdminDashboardSkeleton() {
  return (
    <div className="w-full space-y-8 select-none">
      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm space-y-3"
          >
            <div className="h-3 w-28 rounded-full skeleton-box" />
            <div className="h-8 w-32 rounded-md skeleton-box" />
            <div className="h-3 w-24 rounded-full skeleton-box opacity-60" />
          </div>
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-6 shadow-sm">
          <div className="h-6 w-48 rounded-full skeleton-box mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-8 h-8 rounded-full skeleton-box shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-44 rounded-full skeleton-box" />
                    <div className="h-3 w-28 rounded-full skeleton-box" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="h-5 w-16 rounded-full skeleton-box" />
                  <div className="h-8 w-8 rounded-full skeleton-box" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-6 shadow-sm">
          <div className="h-6 w-52 rounded-full skeleton-box mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-[#f7f7f7] rounded-2xl border border-[#e5e7eb] p-3.5 flex items-center justify-between"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-36 rounded-full skeleton-box" />
                  <div className="h-3 w-48 rounded-full skeleton-box" />
                </div>
                <div className="h-7 w-20 rounded-full skeleton-box shrink-0 ml-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
