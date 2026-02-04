import { VehicleCard } from './VehicleCard';
import type { VehicleWithDetails } from '@/types/vehicle';

interface VehicleGridProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">Nenhum veículo encontrado</p>
        <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.plate} vehicle={vehicle} />
      ))}
    </div>
  );
}
