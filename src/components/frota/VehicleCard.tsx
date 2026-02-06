import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BalanceIndicator } from './BalanceIndicator';
import type { VehicleWithDetails } from '@/types/vehicle';
import { Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: VehicleWithDetails;
  size?: 'normal' | 'large';
  compact?: boolean;
  onClick?: () => void;
}

export function VehicleCard({ vehicle, size = 'normal', compact = false, onClick }: VehicleCardProps) {
  const isLarge = size === 'large';
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg",
        isLarge && "h-full",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Vehicle Image */}
      <div className={cn(
        "relative bg-muted",
        isLarge ? "aspect-video" : compact ? "aspect-square" : "aspect-[4/3]"
      )}>
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`Veículo ${vehicle.plate}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className={cn(
              "text-muted-foreground/30",
              compact ? "h-10 w-10" : "h-16 w-16"
            )} />
          </div>
        )}
        
        {/* Coordination Badge */}
        {vehicle.coordination && (
          <Badge
            className={cn(
              "absolute left-1.5 top-1.5",
              compact ? "text-[10px] px-1.5 py-0.5" : "text-xs"
            )}
            style={{
              backgroundColor: vehicle.coordination.color,
              color: vehicle.coordination.font_color,
            }}
          >
            {compact ? vehicle.coordination.name.substring(0, 8) : vehicle.coordination.name}
          </Badge>
        )}
      </div>

      <CardContent className={cn(
        isLarge ? "p-6" : compact ? "p-2" : "p-4"
      )}>
        {/* Plate */}
        <h3 className={cn(
          "font-mono font-bold tracking-wider",
          isLarge ? "text-2xl" : compact ? "text-sm" : "text-lg"
        )}>
          {vehicle.plate}
        </h3>
        
        {/* Model */}
        <p className={cn(
          "text-muted-foreground truncate",
          isLarge ? "text-base mt-1" : compact ? "text-xs" : "text-sm"
        )}>
          {vehicle.model || 'Modelo não informado'}
        </p>
        
        {/* Fleet Type - hide on compact */}
        {vehicle.fleet_type && !compact && (
          <p className="mt-1 text-xs text-muted-foreground">
            {vehicle.fleet_type}
          </p>
        )}

        {/* Balance */}
        <div className={cn(
          isLarge ? "mt-6" : compact ? "mt-2" : "mt-4"
        )}>
          {!compact && (
            <span className="text-xs text-muted-foreground block mb-1">Saldo Disponível</span>
          )}
          <BalanceIndicator 
            balance={vehicle.balance} 
            size={compact ? 'sm' : isLarge ? 'lg' : 'md'} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
