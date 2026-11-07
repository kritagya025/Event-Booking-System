import React from 'react';

export default function WishlistCardSkeleton() {
  return (
    <div className="bg-asphalt-surface border-2 border-asphalt-border shadow-[3px_3px_0px_rgba(255,255,255,0.05)] p-5 flex flex-col justify-between relative">
      <div>
        {/* Top Header Placeholder */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 w-20 skeleton-box" />
          <div className="h-6 w-6 skeleton-box border border-asphalt-border" />
        </div>

        {/* Title Placeholder */}
        <div className="space-y-2 mb-4">
          <div className="h-6 w-11/12 skeleton-box" />
          <div className="h-6 w-3/5 skeleton-box" />
        </div>

        {/* Date & Location Placeholders */}
        <div className="space-y-2 font-mono-zine text-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 skeleton-box shrink-0" />
            <div className="h-3.5 w-32 skeleton-box" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 skeleton-box shrink-0" />
            <div className="h-3.5 w-48 skeleton-box" />
          </div>
        </div>
      </div>

      {/* Footer Price & Button */}
      <div className="pt-4 border-t border-asphalt-border flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 skeleton-box" />
          <div className="h-6 w-24 skeleton-box" />
        </div>
        <div className="h-9 w-32 skeleton-box border border-asphalt-border shadow-[2px_2px_0px_rgba(255,255,255,0.05)]" />
      </div>
    </div>
  );
}

