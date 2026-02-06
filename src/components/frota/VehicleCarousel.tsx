import { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailModal } from './VehicleDetailModal';
import type { VehicleWithDetails } from '@/types/vehicle';

interface VehicleCarouselProps {
  vehicles: VehicleWithDetails[];
}

export function VehicleCarousel({ vehicles }: VehicleCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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
      <div className="flex flex-col items-center p-4">
        <Carousel
          setApi={setApi}
          className="w-full max-w-md"
          opts={{
            align: 'center',
            loop: true,
          }}
        >
          <CarouselContent>
            {vehicles.map((vehicle) => (
              <CarouselItem key={vehicle.plate}>
                <VehicleCard
                  vehicle={vehicle}
                  size="large"
                  onClick={() => setSelectedVehicle(vehicle)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        {/* Counter */}
        <div className="mt-4 text-sm text-muted-foreground">
          {current} de {count}
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
