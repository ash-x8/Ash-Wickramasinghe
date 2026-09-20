import React from 'react';

interface ContentSkeletonProps {
  type?: 'project' | 'article' | 'service' | 'detail';
  count?: number;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  type = 'project',
  count = 2
}) => {
  const items = Array.from({ length: count });

  if (type === 'project') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
        {items.map((_, i) => (
          <div key={i} className="space-y-4 animate-pulse">
            {/* Image Placeholder */}
            <div className="relative aspect-[16/10] w-full rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.8s_infinite] -translate-x-full" />
              <div className="absolute top-4 left-4 h-6 w-24 bg-neutral-800 rounded-full" />
            </div>

            {/* Title & Excerpt Placeholder */}
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-neutral-800/80 rounded-lg" />
              <div className="h-4 w-full bg-neutral-800/50 rounded" />
              <div className="h-4 w-2/3 bg-neutral-800/40 rounded" />
            </div>

            {/* Tags Placeholder */}
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-16 bg-neutral-800/60 rounded-full" />
              <div className="h-5 w-20 bg-neutral-800/60 rounded-full" />
              <div className="h-5 w-14 bg-neutral-800/60 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'article') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-[#C59B63]/20 rounded" />
              <div className="h-4 w-16 bg-neutral-800 rounded" />
            </div>
            <div className="h-6 w-4/5 bg-neutral-800 rounded-lg" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-neutral-800/60 rounded" />
              <div className="h-3.5 w-full bg-neutral-800/60 rounded" />
              <div className="h-3.5 w-2/3 bg-neutral-800/60 rounded" />
            </div>
            <div className="pt-4 border-t border-neutral-800/60 flex justify-between">
              <div className="h-3.5 w-24 bg-neutral-800/50 rounded" />
              <div className="h-3.5 w-20 bg-neutral-800/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'service') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-neutral-800" />
              <div className="h-4 w-10 bg-neutral-800 rounded" />
            </div>
            <div className="h-7 w-1/2 bg-neutral-800 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-800/60 rounded" />
              <div className="h-4 w-3/4 bg-neutral-800/60 rounded" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-2/3 bg-neutral-800/40 rounded" />
              <div className="h-4 w-1/2 bg-neutral-800/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail Page Skeleton
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="h-5 w-32 bg-neutral-800 rounded-full" />
      <div className="h-10 w-3/4 bg-neutral-800 rounded-xl" />
      <div className="aspect-[16/9] w-full rounded-2xl bg-neutral-900 border border-neutral-800" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-neutral-800/70 rounded" />
        <div className="h-4 w-full bg-neutral-800/70 rounded" />
        <div className="h-4 w-4/5 bg-neutral-800/70 rounded" />
      </div>
    </div>
  );
};
