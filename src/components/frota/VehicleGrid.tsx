import { useState } from 'react';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';
import { motion } from 'framer-motion';

interface VehicleGridProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleGrid({ vehicles }: VehicleGridProps) {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
      >
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.plate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <VehicleCard
              vehicle={vehicle}
              compact
              onClick={() => setSelectedVehicle(vehicle)}
            />
          </motion.div>
        ))}
      </motion.div>
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
