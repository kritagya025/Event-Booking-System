import React from 'react';

export default function BookingCardSkeleton() {
  return (
    <div className="bg-asphalt-surface border-2 border-asphalt-border shadow-[3px_3px_0px_rgba(255,255,255,0.1)] flex flex-col justify-between relative overflow-hidden p-5 space-y-4">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between border-b border-asphalt-border pb-3">
        <div className="h-4 w-32 skeleton-box" />
        <div className="h-5 w-24 skeleton-box border border-asphalt-border" />
      </div>

      {/* Title & Metadata */}
      <div className="space-y-2.5">
        <div className="h-6 w-3/4 skeleton-box" />
        <div className="space-y-1.5 pt-1">
          <div className="h-3.5 w-1/2 skeleton-box" />
          <div className="h-3.5 w-2/3 skeleton-box" />
        </div>
      </div>

      {/* Seats & Allocation Box */}
      <div className="bg-asphalt-black p-3 border border-asphalt-border space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 skeleton-box" />
          <div className="h-4 w-28 skeleton-box" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 skeleton-box" />
          <div className="h-5 w-20 skeleton-box" />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-asphalt-border">
        <div className="h-9 flex-1 skeleton-box border border-asphalt-border" />
        <div className="h-9 flex-1 skeleton-box border border-asphalt-border" />
      </div>
    </div>
  );
}

