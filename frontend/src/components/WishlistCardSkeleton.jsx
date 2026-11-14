import React from 'react';

export default function WishlistCardSkeleton() {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 flex flex-col justify-between shadow-sm">
      <div>
        {/* Top Header Placeholder */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-24 rounded-full skeleton-box" />
          <div className="h-8 w-8 rounded-full skeleton-box" />
        </div>

        {/* Title Placeholder */}
        <div className="space-y-2 mb-4">
          <div className="h-6 w-11/12 rounded-md skeleton-box" />
          <div className="h-6 w-3/5 rounded-md skeleton-box" />
        </div>

        {/* Date & Location Placeholders */}
        <div className="space-y-2.5 text-xs mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full skeleton-box shrink-0" />
            <div className="h-4 w-32 rounded-full skeleton-box" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full skeleton-box shrink-0" />
            <div className="h-4 w-44 rounded-full skeleton-box" />
          </div>
        </div>
      </div>

      {/* Footer Price & Button */}
      <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-16 rounded-full skeleton-box" />
          <div className="h-6 w-24 rounded-md skeleton-box" />
        </div>
        <div className="h-[51px] w-36 rounded-full skeleton-box" />
      </div>
    </div>
  );
}
