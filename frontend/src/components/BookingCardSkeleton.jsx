import React from 'react';

export default function BookingCardSkeleton() {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden p-6 space-y-4">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
        <div className="h-4 w-32 rounded-full skeleton-box" />
        <div className="h-6 w-24 rounded-full skeleton-box" />
      </div>

      {/* Title & Metadata */}
      <div className="space-y-2.5">
        <div className="h-6 w-3/4 rounded-md skeleton-box" />
        <div className="space-y-2 pt-1">
          <div className="h-4 w-1/2 rounded-full skeleton-box" />
          <div className="h-4 w-2/3 rounded-full skeleton-box" />
        </div>
      </div>

      {/* Seats & Allocation Box */}
      <div className="bg-[#f7f7f7] p-4 rounded-xl border border-[#e5e7eb] space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 rounded-full skeleton-box" />
          <div className="h-4 w-28 rounded-full skeleton-box" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 rounded-full skeleton-box" />
          <div className="h-5 w-20 rounded-full skeleton-box" />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 flex flex-col sm:flex-row gap-2 border-t border-[#e5e7eb]">
        <div className="h-[44px] flex-1 rounded-full skeleton-box" />
        <div className="h-[44px] flex-1 rounded-full skeleton-box" />
      </div>
    </div>
  );
}
