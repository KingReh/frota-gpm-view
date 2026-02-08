import { Skeleton } from '@/components/ui/skeleton';

export function VehicleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass-panel overflow-hidden rounded-xl h-[180px] border border-white/5 animate-pulse">
          <div className="h-full bg-white/5" />
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
