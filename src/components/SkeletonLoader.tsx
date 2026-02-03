export function DramaCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[21/9] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
}

export function ContinueWatchingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
  );
}
