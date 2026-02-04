export function UnifiedMediaCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-poster skeleton-base" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 skeleton-base w-full" />
        <div className="h-3.5 skeleton-base w-2/3" />
      </div>
    </div>
  );
}
