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
}

export function VehicleCarousel({ vehicles }: VehicleCarouselProps) {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative py-16">

        <Carousel
          setApi={setApi}
          className="w-full max-w-5xl z-10"
          opts={{
            align: 'center',
            loop: true,
            dragFree: true,
            containScroll: 'trimSnaps',
            duration: 18,
            skipSnaps: true,
          }}
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {vehicles.map((vehicle, index) => (
              <CarouselItem key={vehicle.plate} className="pl-4 md:pl-8 basis-[85%] md:basis-1/2 lg:basis-[60%]">
                <div
                  className="py-4 md:py-8 transition-[transform,opacity] duration-150 ease-out will-change-transform"
                  style={getSlideStyle(index)}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    size="large"
                    hideTelemetry={true}
                    onClick={() => setSelectedVehicle(vehicle)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Custom Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0 bg-zinc-800/90 border-white/10 text-white hover:bg-primary hover:border-primary h-12 w-12 md:h-14 md:w-14 rounded-2xl transition-colors duration-200" />
            <CarouselNext className="static translate-y-0 bg-zinc-800/90 border-white/10 text-white hover:bg-primary hover:border-primary h-12 w-12 md:h-14 md:w-14 rounded-2xl transition-colors duration-200" />
          </div>
        </Carousel>

        {/* Counter / Pager */}
        <div className="mt-12 flex items-center gap-3">
          {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-[width,background-color] duration-200"
              style={{
                width: current === i + 1 ? 40 : 12,
                backgroundColor: current === i + 1 ? "hsl(207, 100%, 35%)" : "rgba(255, 255, 255, 0.1)"
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

