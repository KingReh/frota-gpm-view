import { useState } from 'react';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';


interface VehicleGridProps {
  vehicles: VehicleWithDetails[];
  maintenancePlates?: Set<string>;
  maintenanceEntryDates?: Map<string, string | null>;
}

export function VehicleGrid({ vehicles, maintenancePlates, maintenanceEntryDates }: VehicleGridProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5 pb-8">
        {vehicles.map((vehicle) => (
          <div key={vehicle.plate} className="h-full">
            <VehicleCard
              vehicle={vehicle}
              compact
              isInMaintenance={maintenancePlates?.has(vehicle.plate)}
              maintenanceEntryDate={maintenanceEntryDates?.get(vehicle.plate) ?? null}
              onClick={() => setSelectedVehicle(vehicle)}
            />
          </div>
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
