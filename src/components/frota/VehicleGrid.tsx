import { useState } from 'react';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';

interface VehicleGridProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">Nenhum veículo encontrado</p>
        <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.plate}
            vehicle={vehicle}
            compact
            onClick={() => setSelectedVehicle(vehicle)}
          />
        ))}
      </div>
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
