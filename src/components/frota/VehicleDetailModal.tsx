import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CoordinationBadge } from './CoordinationBadge';
import { BalanceIndicator } from './BalanceIndicator';
import { formatBalance } from '@/lib/balance';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Car, MapPin, User, CreditCard, Building2, Gauge, Calendar, DollarSign, Activity, X, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { VehicleWithDetails } from '@/types/vehicle';
import { cn } from '@/lib/utils';

interface VehicleDetailModalProps {
  vehicle: VehicleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string | null, className?: string }) {
  if (!value) return null;
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors", className)}>
      <div className="p-2 rounded-md bg-surface-overlay text-primary">
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function FinancialItem({ label, value, highlight = false }: { label: string; value: string | null, highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className={cn(
      "flex flex-col p-3 rounded-lg border transition-all",
      highlight
        ? "bg-primary/10 border-primary/20"
        : "bg-muted/20 border-border/20"
    )}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{label}</span>
      <span className={cn(
        "text-sm font-mono font-bold",
        highlight ? "text-primary" : "text-foreground"
      )}>{formatBalance(value)}</span>
    </div>
  );
}

export function VehicleDetailModal({ vehicle, open, onOpenChange }: VehicleDetailModalProps) {
  const { preferences, toggleFavorite } = useUserPreferences();
  if (!vehicle) return null;

  const hasFinancialData = vehicle.current_limit || vehicle.used_value || vehicle.reserved_value || vehicle.next_period_limit;
  const isFavorite = preferences.favoritePlates?.includes(vehicle.plate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden glass-panel border-border/40 shadow-lg bg-card/95 [&>button]:hidden">

        {/* Header / Hero Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {/* Explicit Close Button */}
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-surface-elevated hover:bg-surface-interactive text-foreground border border-border/40 transition-all hover:scale-105 active:scale-95"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Background Image/Gradient */}
          <div className="absolute inset-0 bg-background/50 z-10" />
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={`Veículo ${vehicle.plate}`}
              className="h-full w-full object-cover blur-[2px] scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-surface-overlay" />
          )}

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-t from-background via-background/60 to-transparent">
            <div className="flex items-end justify-between">
              <div>
                {vehicle.coordination && (
                  <CoordinationBadge
                    coordination={vehicle.coordination}
                    className="mb-2"
                  />
                )}
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle className="font-mono text-4xl font-bold tracking-tight text-foreground">
                    {vehicle.plate}
                  </DialogTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-full border transition-all",
                      isFavorite
                        ? "bg-accent-favorite/10 border-accent-favorite/50 text-accent-favorite hover:bg-accent-favorite/20"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:text-accent-favorite hover:bg-muted/30 hover:border-accent-favorite/30"
                    )}
                    onClick={() => toggleFavorite(vehicle.plate)}
                  >
                    <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
                  </Button>
                </div>
                <DialogDescription className="text-muted-foreground font-medium flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  {[vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ') || 'Modelo não informado'}
                </DialogDescription>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saldo Atual</p>
                <BalanceIndicator balance={vehicle.balance} size="lg" className="text-xl px-4 py-1.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Column 1: Vehicle Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Activity className="w-3 h-3" /> Especificações
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <DetailRow icon={Car} label="Tipo de Frota" value={vehicle.fleet_type} />
                <DetailRow icon={Building2} label="Concessionária" value={vehicle.manufacturer} />
                <DetailRow icon={Gauge} label="Nº Frota" value={vehicle.fleet_number} />
                <DetailRow icon={CreditCard} label="Nº Cartão" value={vehicle.card_number} />
              </div>
            </div>

            {/* Column 2: Financials */}
            {hasFinancialData && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'hsl(var(--balance-high))' }}>
                  <DollarSign className="w-3 h-3" /> Financeiro
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2">
                    <FinancialItem label="Limite Total" value={vehicle.current_limit} highlight />
                  </div>
                  <FinancialItem label="Utilizado" value={vehicle.used_value} />
                  <FinancialItem label="Reservado" value={vehicle.reserved_value} />
                  <div className="sm:col-span-2">
                    <FinancialItem label="Limite Próx. Período" value={vehicle.next_period_limit} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-overlay border-t border-border/20 flex justify-end">
          {/* Add actions if needed */}
        </div>

      </DialogContent>
    </Dialog>
  );
}
