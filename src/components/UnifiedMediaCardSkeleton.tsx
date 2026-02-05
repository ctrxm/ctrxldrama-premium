export function UnifiedMediaCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-poster rounded-2xl skeleton-base skeleton-wave" />
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-4 w-full skeleton-base skeleton-wave rounded-lg" />
        <div className="h-3 w-2/3 skeleton-base skeleton-wave rounded-lg" />
      </div>
    </div>
  );
}

export function ContinueWatchingSkeleton() {
  return (
    <div className="block">
      <div className="aspect-video rounded-xl skeleton-base skeleton-wave" />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-4 w-full skeleton-base skeleton-wave rounded-lg" />
        <div className="h-3 w-1/3 skeleton-base skeleton-wave rounded-lg" />
      </div>
    </div>
  );
}
