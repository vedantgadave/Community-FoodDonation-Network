import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'table' | 'text';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, type = 'card' }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm p-4"
          >
            <div className="bg-slate-200 dark:bg-slate-800 h-44 rounded-xl mb-4 w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-2">
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
      ))}
    </div>
  );
};
