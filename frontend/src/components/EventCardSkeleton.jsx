import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-asphalt-surface border-2 border-asphalt-border p-4 flex flex-col justify-between h-[380px] animate-pulse">
      {/* Top Banner Placeholder */}
      <div className="w-full h-44 bg-asphalt-card border border-asphalt-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Title & Metadata Skeletons */}
      <div className="space-y-3 mt-4 flex-1">
        <div className="h-3 w-24 bg-asphalt-card" />
        <div className="h-6 w-3/4 bg-asphalt-card" />
        <div className="space-y-1.5 pt-2">
          <div className="h-3 w-1/2 bg-asphalt-card" />
          <div className="h-3 w-2/3 bg-asphalt-card" />
        </div>
      </div>

      {/* Bottom Action Skeleton */}
      <div className="pt-3 border-t border-asphalt-border flex items-center justify-between mt-3">
        <div className="h-6 w-16 bg-asphalt-card" />
        <div className="h-8 w-28 bg-asphalt-card border border-asphalt-border" />
      </div>
    </div>
  );
}

