export function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-reader-border bg-reader-card p-5">
          <div className="h-4 w-28 animate-pulse rounded-full bg-reader-border" />
          <div className="mt-6 h-5 w-4/5 animate-pulse rounded-full bg-reader-border" />
          <div className="mt-3 h-4 w-3/5 animate-pulse rounded-full bg-reader-border" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-reader-border" />
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-reader-border" />
            <div className="h-3 w-8/12 animate-pulse rounded-full bg-reader-border" />
          </div>
        </div>
      ))}
    </div>
  );
}
