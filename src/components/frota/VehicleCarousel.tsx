import { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
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
        {/* Cinematic Backdrop - Automotive Stage */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80" />
        </div>

        <Carousel
          setApi={setApi}
          className="w-full max-w-5xl z-10"
          opts={{
            align: 'center',
            loop: true,
          }}
        >
          <CarouselContent className="-ml-8"> {/* 32px gap */}
            {vehicles.map((vehicle) => (
              <CarouselItem key={vehicle.plate} className="pl-8 md:basis-1/2 lg:basis-[60%]">
                <div className="py-8"> {/* 32px vertical padding */}
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
            <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-primary hover:border-primary h-14 w-14 rounded-2xl backdrop-blur-md transition-all duration-300" />
            <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-primary hover:border-primary h-14 w-14 rounded-2xl backdrop-blur-md transition-all duration-300" />
          </div>
        </Carousel>

        {/* Counter / Pager - 8px Multiples */}
        <div className="mt-12 flex items-center gap-3">
          {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                width: current === i + 1 ? 40 : 12, // 8 * 5 : 8 * 1.5
                backgroundColor: current === i + 1 ? "rgba(255, 45, 32, 1)" : "rgba(255, 255, 255, 0.1)"
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                current === i + 1 ? "shadow-[0_0_20px_rgba(255,45,32,0.6)]" : ""
              )}
            />
          ))}
          {count > 12 && <span className="text-[10px] font-mono text-zinc-500 ml-4 font-bold whitespace-nowrap">Página {current} / {count}</span>}
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

