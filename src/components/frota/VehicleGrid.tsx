import { useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';
import { useIsMobile } from '@/hooks/use-mobile';

interface VehicleGridProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Determine columns based on viewport
  const getColumns = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    if (w < 1280) return 3;
    return 4;
  }, []);

  const columns = getColumns();
  const rowCount = Math.ceil(vehicles.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? 340 : 420,
    overscan: 3,
  });

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-xl">
        <p className="text-lg text-muted-foreground">Nenhum veículo encontrado</p>
        <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={parentRef}
        className="h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns;
            const rowVehicles = vehicles.slice(startIndex, startIndex + columns);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: '1.5rem',
                  paddingBottom: '1.5rem',
                }}
              >
                {rowVehicles.map((vehicle) => (
                  <div key={vehicle.plate}>
                    <VehicleCard
                      vehicle={vehicle}
                      compact
                      onClick={() => setSelectedVehicle(vehicle)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
