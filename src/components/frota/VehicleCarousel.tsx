import { useState, useEffect, useCallback } from 'react';
import { Car } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface VehicleCarouselProps {
  vehicles: VehicleWithDetails[];
  maintenancePlates?: Set<string>;
  maintenanceEntryDates?: Map<string, string | null>;
}

export function VehicleCarousel({ vehicles, maintenancePlates, maintenanceEntryDates }: VehicleCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

  const onScroll = useCallback(() => {
    if (!api) return;
    setScrollProgress(api.scrollProgress());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setScrollSnaps(api.scrollSnapList());
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    api.on('scroll', onScroll);

    return () => {
      api.off('scroll', onScroll);
    };
  }, [api, onScroll]);

  // Calculate scale/opacity for each slide based on distance from center
  const getSlideStyle = (index: number) => {
    if (!api || scrollSnaps.length === 0) {
      return { transform: 'scale(1)', opacity: 1 };
    }

    const snapPosition = scrollSnaps[index] || 0;
    const diffToTarget = scrollProgress - snapPosition;
    // Normalize distance (0 = center, 1 = fully off)
    const distance = Math.abs(diffToTarget);
    
    const scale = Math.max(0.82, 1 - distance * 0.35);
    const opacity = Math.max(0.4, 1 - distance * 1.2);

    return {
      transform: `scale(${scale})`,
      opacity,
    };
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border border-white/10 bg-zinc-900/90">
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Car className="w-12 h-12 text-primary opacity-50" />
        </div>
        <p className="text-xl font-bold text-white tracking-tight">Nenhum veículo em pista</p>
        <p className="text-sm text-zinc-500 mt-2">Ajuste os filtros de telemetria</p>
      </div>
    );
  }

    return (
    <>
      <div className="flex flex-col items-center justify-start relative pt-1 sm:pt-2 md:pt-3 pb-8 sm:pb-12 w-full">

        <Carousel
          setApi={setApi}
          className="w-full max-w-6xl z-10"
          opts={{
            align: 'center',
            loop: true,
            dragFree: true,
            containScroll: 'trimSnaps',
            duration: 18,
            skipSnaps: true,
          }}
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {vehicles.map((vehicle, index) => (
              <CarouselItem key={vehicle.plate} className="pl-4 md:pl-6 basis-[85%] md:basis-[42%] lg:basis-[34%] xl:basis-[30%]">
                <div
                  className="py-2 md:py-3 transition-[transform,opacity] duration-150 ease-out will-change-transform"
                  style={getSlideStyle(index)}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    size="large"
                    hideTelemetry={true}
                    isInMaintenance={maintenancePlates?.has(vehicle.plate)}
                    maintenanceEntryDate={maintenanceEntryDates?.get(vehicle.plate) ?? null}
                    showDescription={true}
                    onClick={() => setSelectedVehicle(vehicle)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom Controls */}
          <div className="flex justify-center gap-4 mt-6 md:mt-8">
            <CarouselPrevious className="static translate-y-0 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary h-11 w-11 md:h-12 md:w-12 rounded-2xl transition-colors duration-200 shadow-md" />
            <CarouselNext className="static translate-y-0 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary h-11 w-11 md:h-12 md:w-12 rounded-2xl transition-colors duration-200 shadow-md" />
          </div>
        </Carousel>

        {/* Counter / Pager */}
        <div className="mt-6 md:mt-8 flex items-center gap-3">
          {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-200",
                current === i + 1 ? "bg-primary" : "bg-muted-foreground/30"
              )}
              style={{
                width: current === i + 1 ? 40 : 12,
              }}
            />
          ))}
          {count > 12 && <span className="text-[10px] font-mono text-muted-foreground ml-4 font-bold whitespace-nowrap">Página {current} / {count}</span>}
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

