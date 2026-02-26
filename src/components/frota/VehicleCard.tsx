import { Car, Building2, Info, Gauge as GaugeIcon, Fuel, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gauge } from './Gauge';
import { CoordinationBadge } from './CoordinationBadge';
import { cn } from '@/lib/utils';
import { parseBalance } from '@/lib/balance';
import { simplifyFuelType } from '@/lib/fuel';
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

  return (
    <div className="relative transition-opacity duration-300">
      <Card
        className={cn(
          "relative overflow-hidden group border border-border/40 bg-card shadow-lg transition-colors duration-500",
          "rounded-[24px] overflow-hidden",
          isLarge ? "h-full" : compact ? "min-h-[160px]" : "min-h-[320px]"
        )}
      >
        {/* Cinematic Header / Image Container */}
        <div className={cn(
          "relative w-full overflow-hidden bg-surface-overlay flex items-center justify-center",
          isLarge ? "h-64" : compact ? "h-32" : "h-48"
        )}>
          {/* Dynamic Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-primary/5 z-0" />

          {/* Branding / Badge Slot (Top Left) */}
          {vehicle.coordination && (
            <div className="absolute left-6 top-6 z-20">
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
                "h-10 w-10 rounded-xl bg-surface-elevated border transition-all duration-300",
                isFavorite
                  ? "border-accent-favorite/50 text-accent-favorite hover:bg-accent-favorite/20"
                  : "border-border/40 text-muted-foreground hover:text-accent-favorite hover:bg-muted/30 hover:border-accent-favorite/30"
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
                className="h-10 w-10 rounded-xl bg-surface-elevated border border-border/40 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Main Vehicle Image */}
          <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={`Veículo ${vehicle.plate}`}
                className="max-h-full max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                <Car className="w-16 h-16" />
                <span className="text-[10px] uppercase tracking-widest font-black">No Visualization</span>
              </div>
            )}
          </div>

          {/* Bottom Overlay Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8 relative z-20">
          {/* Main Info Row */}
          <div className="flex flex-col gap-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-4 bg-primary rounded-full" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Identificação</span>
                </div>
                <div className="bg-surface-overlay border border-border/40 px-4 py-2 rounded-lg text-foreground font-mono font-bold tracking-[0.2em] text-2xl shadow-inner group-hover:border-primary/40 transition-colors">
                  {vehicle.plate}
                </div>
                <h3 className="text-foreground text-lg font-bold tracking-tight line-clamp-1 opacity-90">
                  {vehicle.model || 'Protótipo não identificado'}
                </h3>
              </div>

              {/* Technical Badges */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Combustível</span>
                  <div className="flex items-center gap-2 text-foreground/80 bg-muted/20 px-3 py-1 rounded-md border border-border/20">
                    <Fuel className="w-3 h-3 text-accent-fuel" />
                    <span className="text-[10px] uppercase font-bold tracking-wider truncate max-w-[120px]">
                      {simplifyFuelType(vehicle.fuel_type)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Tipo de Frota</span>
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
              "grid gap-8 items-center pt-8 border-t border-border/20",
              hideTelemetry ? "grid-cols-1" : "grid-cols-2"
            )}>
              {!hideTelemetry && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent-fuel/10 border border-accent-fuel/20">
                      <Fuel className="w-4 h-4 text-accent-fuel" />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-tight">Consumo</div>
                      <div className="text-xs text-foreground font-mono font-bold">4.2 km/l</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent-status/10 border border-accent-status/20">
                      <Zap className="w-4 h-4 text-accent-status" />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest leading-tight">Status</div>
                      <div className="text-xs font-bold uppercase tracking-tighter" style={{ color: 'hsl(var(--balance-high))' }}>Em Operação</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn(
                "flex relative transition-all duration-500",
                hideTelemetry ? "justify-center scale-125 py-4" : "justify-end"
              )}>
                <Gauge
                  value={balanceValue}
                  max={parseBalance(vehicle.next_period_limit)}
                  label="SALDO ATUAL"
                  size={hideTelemetry ? "lg" : "md"}
                />
              </div>
            </div>
          )}

          {/* Compact View Stats */}
          {compact && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[7px] text-muted-foreground uppercase font-black">Concessionária</span>
                  <span className="text-[9px] text-foreground/70 truncate max-w-[80px]">{vehicle.manufacturer || 'N/I'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] text-muted-foreground uppercase font-black">Frota</span>
                  <span className="text-[9px] text-primary font-bold uppercase">{vehicle.fleet_type || 'Geral'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="font-mono font-black text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {balanceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <GaugeIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Highlight Ring */}
        <div className="absolute inset-0 rounded-[24px] ring-1 ring-border/40 group-hover:ring-primary/40 transition-all duration-700 pointer-events-none z-30" />

        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Card>
    </div>
  );
}
