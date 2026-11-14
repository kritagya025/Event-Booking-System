import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] border border-[#e5e7eb] relative flex flex-col justify-between overflow-hidden shadow-sm">
      {/* 1. Artwork / Poster Skeleton */}
      <div className="relative h-52 sm:h-56 w-full skeleton-box">
        {/* Top Badges Placeholder */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="h-6 w-20 bg-neutral-200/80 rounded-full" />
          <div className="h-8 w-8 bg-neutral-200/80 rounded-full" />
        </div>

        {/* Date Pill Placeholder */}
        <div className="absolute bottom-3 left-3 h-6 w-36 bg-neutral-200/80 rounded-full" />
      </div>

      {/* 2. Content Body Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Cinema tags row */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-5 w-16 skeleton-box rounded-full" />
            <div className="h-5 w-14 skeleton-box rounded-full" />
            <div className="h-5 w-14 skeleton-box rounded-full" />
          </div>

          {/* Event Title Skeleton */}
          <div className="space-y-1.5">
            <div className="h-6 w-11/12 skeleton-box rounded-lg" />
            <div className="h-6 w-3/5 skeleton-box rounded-lg" />
          </div>

          {/* Venue & Location Skeleton */}
          <div className="h-3.5 w-48 skeleton-box rounded-md mt-2" />
        </div>

        <div>
          {/* Showtimes row skeleton */}
          <div className="mb-3.5 pt-3 border-t border-[#e5e7eb] space-y-1.5">
            <div className="h-3 w-28 skeleton-box rounded-md" />
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map(t => (
                <div key={t} className="h-7 skeleton-box rounded-full" />
              ))}
            </div>
          </div>

          {/* Price & Seat Box Skeleton */}
          <div className="bg-[#f7f7f7] p-3 rounded-2xl border border-[#e5e7eb] mb-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-16 skeleton-box rounded-md" />
              <div className="h-6 w-20 skeleton-box rounded-md" />
            </div>
            <div className="space-y-1 flex flex-col items-end">
              <div className="h-3 w-12 skeleton-box rounded-md" />
              <div className="h-5 w-16 skeleton-box rounded-md" />
            </div>
          </div>

          {/* Action Button Skeleton: 51px pill */}
          <div className="h-[51px] w-full skeleton-box rounded-full" />
        </div>
      </div>
    </div>
  );
}
