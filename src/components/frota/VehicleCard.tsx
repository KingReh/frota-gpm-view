import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BalanceIndicator } from './BalanceIndicator';
import type { VehicleWithDetails } from '@/types/vehicle';
import { Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: VehicleWithDetails;
  size?: 'normal' | 'large';
}

export function VehicleCard({ vehicle, size = 'normal' }: VehicleCardProps) {
  const isLarge = size === 'large';
  
  return (
    <Card className={cn(
      "overflow-hidden transition-shadow hover:shadow-lg",
      isLarge && "h-full"
    )}>
      {/* Vehicle Image */}
      <div className={cn(
        "relative bg-muted",
        isLarge ? "aspect-video" : "aspect-[4/3]"
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
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Coordination Badge */}
        {vehicle.coordination && (
          <Badge
            className="absolute left-2 top-2 text-xs"
            style={{
              backgroundColor: vehicle.coordination.color,
              color: vehicle.coordination.font_color,
            }}
          >
            {vehicle.coordination.name}
          </Badge>
        )}
      </div>

      <CardContent className={cn("p-4", isLarge && "p-6")}>
        {/* Plate */}
        <h3 className={cn(
          "font-mono font-bold tracking-wider",
          isLarge ? "text-2xl" : "text-lg"
        )}>
          {vehicle.plate}
        </h3>
        
        {/* Model */}
        <p className={cn(
          "text-muted-foreground",
          isLarge ? "text-base mt-1" : "text-sm"
        )}>
          {vehicle.model || 'Modelo não informado'}
        </p>
        
        {/* Fleet Type */}
        {vehicle.fleet_type && (
          <p className="mt-1 text-xs text-muted-foreground">
            {vehicle.fleet_type}
          </p>
        )}

        {/* Balance */}
        <div className={cn("mt-4", isLarge && "mt-6")}>
          <span className="text-xs text-muted-foreground block mb-1">Saldo Disponível</span>
          <BalanceIndicator 
            balance={vehicle.balance} 
            size={isLarge ? 'lg' : 'md'} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
