import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BalanceIndicator } from './BalanceIndicator';
import { formatBalance } from '@/lib/balance';
import { Car, MapPin, User, CreditCard, Building2, Gauge } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { VehicleWithDetails } from '@/types/vehicle';

interface VehicleDetailModalProps {
  vehicle: VehicleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function FinancialItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium font-mono text-foreground">{formatBalance(value)}</span>
    </div>
  );
}

export function VehicleDetailModal({ vehicle, open, onOpenChange }: VehicleDetailModalProps) {
  if (!vehicle) return null;

  const hasFinancialData = vehicle.current_limit || vehicle.used_value || vehicle.reserved_value || vehicle.next_period_limit || vehicle.limit_value;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Vehicle Image */}
        <div className="relative aspect-video bg-muted">
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={`Veículo ${vehicle.plate}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}

          {vehicle.coordination && (
            <Badge
              className="absolute left-3 top-3"
              style={{
                backgroundColor: vehicle.coordination.color,
                color: vehicle.coordination.font_color,
              }}
            >
              {vehicle.coordination.name}
            </Badge>
          )}
        </div>

        <div className="p-5 space-y-5">
          <DialogHeader className="space-y-1 p-0">
            <DialogTitle className="font-mono text-2xl tracking-wider">
              {vehicle.plate}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {[vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ') || 'Modelo não informado'}
            </DialogDescription>
          </DialogHeader>

          {/* Balance */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Saldo Disponível</span>
            <BalanceIndicator balance={vehicle.balance} size="lg" />
          </div>

          <Separator />

          {/* Vehicle Info */}
          <div className="grid gap-3">
            <DetailRow icon={Car} label="Tipo de Frota" value={vehicle.fleet_type} />
            <DetailRow icon={Gauge} label="Nº Frota" value={vehicle.fleet_number} />
            <DetailRow icon={MapPin} label="Localização" value={vehicle.location} />
            <DetailRow icon={User} label="Responsável" value={vehicle.responsible_name} />
            <DetailRow icon={CreditCard} label="Nº Cartão" value={vehicle.card_number} />
            <DetailRow icon={Building2} label="Centro de Custo" value={vehicle.cost_center} />
          </div>

          {/* Financial Details */}
          {hasFinancialData && (
            <>
              <Separator />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Detalhes Financeiros
                </h4>
                <div className="rounded-lg border bg-muted/30 px-3 py-1">
                  <FinancialItem label="Limite" value={vehicle.limit_value} />
                  <FinancialItem label="Limite Atual" value={vehicle.current_limit} />
                  <FinancialItem label="Valor Utilizado" value={vehicle.used_value} />
                  <FinancialItem label="Valor Reservado" value={vehicle.reserved_value} />
                  <FinancialItem label="Limite Próx. Período" value={vehicle.next_period_limit} />
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
