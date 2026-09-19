import { Skeleton } from '@/components/ui/skeleton';

export function VehicleGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5 pb-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="glass-panel overflow-hidden rounded-xl sm:rounded-2xl h-[230px] sm:h-[260px] border border-white/5 animate-pulse flex flex-col justify-between p-2.5 sm:p-3"
        >
          <div className="w-full aspect-[16/10] bg-white/5 rounded-lg" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
            <div className="h-3.5 bg-white/5 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VehicleTableSkeleton() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-border/70 shadow-2xl bg-card/85 mx-0">
      <div className="p-4 border-b border-border/60 flex items-center justify-between gap-4 bg-muted/20">
        <Skeleton className="h-6 w-36 bg-muted/60 rounded-md" />
        <Skeleton className="h-6 w-24 bg-muted/60 rounded-md" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <Skeleton className="w-16 h-10 rounded-lg bg-muted/60 shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-[240px]">
                <Skeleton className="h-4 w-20 bg-muted/60 rounded" />
                <Skeleton className="h-3.5 w-40 bg-muted/50 rounded" />
              </div>
            </div>
            <Skeleton className="hidden md:block h-6 w-24 bg-muted/50 rounded" />
            <Skeleton className="hidden lg:block h-6 w-20 bg-muted/50 rounded" />
            <Skeleton className="hidden sm:block h-6 w-24 bg-muted/50 rounded-full" />
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-5 w-24 bg-muted/60 rounded" />
              <Skeleton className="h-1 w-20 bg-muted/50 rounded-full" />
            </div>
            <Skeleton className="hidden md:block h-8 w-8 rounded-lg bg-muted/50 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
