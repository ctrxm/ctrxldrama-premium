export function UnifiedMediaCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-poster rounded-xl skeleton-base" />
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-4 w-full skeleton-base rounded-md" />
        <div className="h-4 w-2/3 skeleton-base rounded-md" />
      </div>
    </div>
  );
}
