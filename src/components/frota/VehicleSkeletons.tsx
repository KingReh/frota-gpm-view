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
    <div className="glass-panel rounded-xl overflow-hidden p-4 space-y-3 border border-white/5">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-white/5" />
      ))}
    </div>
  );
}
