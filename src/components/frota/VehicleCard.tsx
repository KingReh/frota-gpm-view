import { motion } from 'framer-motion';
import { Car, Building2, Info, Gauge as GaugeIcon, Fuel, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gauge } from './Gauge';
import { CoordinationBadge } from './CoordinationBadge';
import { cn } from '@/lib/utils';
import { parseBalance } from '@/lib/balance';
import type { VehicleWithDetails } from '@/types/vehicle';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface VehicleCardProps {
  vehicle: VehicleWithDetails;
  size?: 'normal' | 'large';
  compact?: boolean;
  hideTelemetry?: boolean;
  onClick?: () => void;
}

export function VehicleCard({ vehicle, size = 'normal', compact = false, hideTelemetry = false, onClick }: VehicleCardProps) {
  const { preferences, toggleFavorite } = useUserPreferences();
  const isLarge = size === 'large';
  const balanceValue = parseBalance(vehicle.balance);
  const isFavorite = preferences.favoritePlates?.includes(vehicle.plate);

  // Digital Cockpit variants for Framer Motion
  const cockpitVariants = {
    initial: { opacity: 0, scale: 0.92, y: 15 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 15
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      variants={cockpitVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="relative"
    >
      <Card
        className={cn(
          "relative overflow-hidden group border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-colors duration-500",
          "rounded-[24px] overflow-hidden", // 8px * 3
          isLarge ? "h-full" : compact ? "min-h-[160px]" : "min-h-[320px]"
        )}
      >
        {/* Cinematic Header / Image Container */}
        <div className={cn(
          "relative w-full overflow-hidden bg-zinc-950/50 flex items-center justify-center",
          isLarge ? "h-64" : compact ? "h-32" : "h-48" // Multiples of 8: 64=512px (wait, tailwind units h-64=16rem=256px), h-48=192px, h-32=128px
        )}>
          {/* Blurred Backdrop for contained images */}
          {vehicle.image_url && (
            <div
              className="absolute inset-0 opacity-20 blur-3xl scale-125 pointer-events-none"
              style={{
                backgroundImage: `url(${vehicle.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          {/* Dynamic Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-primary/5 z-0" />

          {/* Branding / Badge Slot (Top Left) */}
          {vehicle.coordination && (
            <div className="absolute left-6 top-6 z-20"> {/* 8px * 3 = 24px = p-6 */}
              <CoordinationBadge
                coordination={vehicle.coordination}
                compact={compact}
                className="shadow-2xl"
              />
            </div>
          )}

          {/* Action Slot (Top Right) */}
          <div className="absolute right-6 top-6 z-30 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-10 w-10 rounded-xl backdrop-blur-md border transition-all duration-300",
                isFavorite
                  ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  : "bg-white/5 border-white/15 text-white/40 hover:text-yellow-400 hover:bg-white/10 hover:border-yellow-500/30"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(vehicle.plate);
              }}
            >
              <Star className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>

            {onClick && (
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/15 text-white hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_0_20px_rgba(255,45,32,0.4)] transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Main Vehicle Image - PIXEL PERFECT CONTAINMENT */}
          <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={`Veículo ${vehicle.plate}`}
                className="max-h-full max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-zinc-700">
                <Car className="w-16 h-16 opacity-20" />
                <span className="text-[10px] uppercase tracking-widest font-black opacity-30">No Visualization</span>
              </div>
            )}
          </div>

          {/* Bottom Overlay Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        </div>

        {/* Content Section - 8px Grid Applied */}
        <div className="p-8 space-y-8 relative z-20"> {/* 8px * 4 = 32px padding */}

          {/* Main Info Row */}
          <div className="flex flex-col gap-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-4 bg-primary rounded-full" />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Identificação</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-white font-mono font-bold tracking-[0.2em] text-2xl shadow-inner group-hover:border-primary/40 transition-colors">
                  {vehicle.plate}
                </div>
                <h3 className="text-white text-lg font-bold tracking-tight line-clamp-1 opacity-90">
                  {vehicle.model || 'Protótipo não identificado'}
                </h3>
              </div>

              {/* Technical Badges - More prominent now */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Concessionária</span>
                  <div className="flex items-center gap-2 text-white/80 bg-white/5 px-3 py-1 rounded-md border border-white/5">
                    <Building2 className="w-3 h-3 text-secondary" />
                    <span className="text-[10px] uppercase font-bold tracking-wider truncate max-w-[120px]">
                      {vehicle.manufacturer || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">Tipo de Frota</span>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] uppercase tracking-wider py-0.5 px-3 rounded-md">
                    {vehicle.fleet_type || 'Geral'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry / Balance Grid */}
          {!compact && (
            <div className={cn(
              "grid gap-8 items-center pt-8 border-t border-white/5",
              hideTelemetry ? "grid-cols-1" : "grid-cols-2"
            )}>
              {!hideTelemetry && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Fuel className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-tight">Consumo</div>
                      <div className="text-xs text-white font-mono font-bold">4.2 km/l</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <Zap className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-tight">Status</div>
                      <div className="text-xs text-eco-green font-bold uppercase tracking-tighter">Em Operação</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn(
                "flex relative transition-all duration-500",
                hideTelemetry ? "justify-center scale-125 py-4" : "justify-end"
              )}>
                <div className="absolute -inset-8 bg-primary/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <Gauge
                  value={balanceValue}
                  max={parseBalance(vehicle.next_period_limit)}
                  label="SALDO ATUAL"
                  size={hideTelemetry ? "lg" : "md"}
                />
              </div>
            </div>
          )}

          {/* Compact View Stats - Now enriched with info */}
          {compact && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[7px] text-zinc-500 uppercase font-black">Concessionária</span>
                  <span className="text-[9px] text-white/70 truncate max-w-[80px]">{vehicle.manufacturer || 'N/A'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] text-zinc-500 uppercase font-black">Frota</span>
                  <span className="text-[9px] text-primary font-bold uppercase">{vehicle.fleet_type || 'Geral'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="font-mono font-black text-lg bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                  {balanceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <GaugeIcon className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Highlight Ring (8px border radius compatible) */}
        <div className="absolute inset-0 rounded-[24px] ring-1 ring-white/10 group-hover:ring-primary/40 transition-all duration-700 pointer-events-none z-30" />

        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Card>
    </motion.div>
  );
}



