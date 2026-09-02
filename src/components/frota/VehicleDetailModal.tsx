import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { MaintenanceModal } from './MaintenanceModal';
import { formatBalance } from '@/lib/balance';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { useVehicleMaintenance } from '@/hooks/useVehicleMaintenance';
import { useVehicles } from '@/hooks/useVehicles';
import { useCoordinations } from '@/hooks/useCoordinations';
import { Car, MapPin, User, CreditCard, Building2, Gauge, Calendar, DollarSign, Activity, X, Star, Fuel, Wrench, AlertTriangle, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { VehicleWithDetails } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { isBalanceMasked } from '@/lib/maskedPlates';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface VehicleDetailModalProps {
  vehicle: VehicleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_TOOLTIPS: Record<string, string> = {
  'Tipo de Frota': 'Indica se o veículo é locado ou próprio da empresa.',
  'Combustível': 'Indica o tipo de combustível permitido para o veículo conforme registrado no CRLV.',
  'Concessionária': 'Identifica a concessionária responsável pelo veículo.',
  'Nº Frota': 'Número de identificação da frota atribuído ao veículo.',
  'Nº Cartão': 'Número do cartão de abastecimento vinculado ao veículo.',
  'Limite Total': 'Valor máximo de saldo que o cartão pode suportar por padrão, podendo ser ajustado conforme necessidade.',
  'Utilizado': 'Valor já consumido do limite disponível.',
  'Reservado': 'Valor reservado automaticamente ao veículo quando ocorre a virada de período/mês.',
  'Limite Próx. Período': 'Valor de recurso que o veículo receberá no início de cada mês.',
};

function DetailRow({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string | null, className?: string }) {
  if (!value) return null;
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors", className)}>
      <div className="p-2 rounded-md bg-surface-overlay text-primary">
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          {FIELD_TOOLTIPS[label] && <InfoTooltip text={FIELD_TOOLTIPS[label]} />}
        </div>
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
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        {FIELD_TOOLTIPS[label] && <InfoTooltip text={FIELD_TOOLTIPS[label]} />}
      </div>
      <span className={cn(
        "text-sm font-mono font-bold",
        highlight ? "text-primary" : "text-foreground"
      )}>{formatBalance(value)}</span>
    </div>
  );
}

export function VehicleDetailModal({ vehicle, open, onOpenChange }: VehicleDetailModalProps) {
  const { preferences, toggleFavorite } = useUserPreferences();
  const { toast } = useToast();
  const { records: maintenanceRecords } = useVehicleMaintenance();
  const { data: allVehicles = [], undefinedVehicles = [] } = useVehicles({ selectedCoordinations: [], enableRealtime: false });
  const { data: coordinations = [] } = useCoordinations();
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  const maintenanceRecord = useMemo(() => {
    if (!vehicle) return null;
    return maintenanceRecords.find(
      (r) => r.plate === vehicle.plate && !!r.workshop_entry_date
    ) ?? null;
  }, [maintenanceRecords, vehicle]);

  if (!vehicle) return null;

  const hasFinancialData = vehicle.current_limit || vehicle.used_value || vehicle.reserved_value || vehicle.next_period_limit;
  const isFavorite = preferences.favoritePlates?.includes(vehicle.plate);
  const masked = isBalanceMasked(vehicle.plate);
  const isInMaintenance = !!maintenanceRecord;

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null;
    try {
      return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return iso;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 glass-panel border-border/40 shadow-lg bg-card/95 [&>button]:hidden overflow-visible">
        <DialogDescription className="sr-only">
          Detalhes completos do veículo selecionado
        </DialogDescription>

        {/* Header / Hero Section */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
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
                  <DialogTitle
                    className="font-mono text-4xl font-bold tracking-tight text-foreground cursor-pointer hover:text-primary transition-colors active:scale-95"
                    title="Clique para copiar a placa"
                    onClick={() => {
                      navigator.clipboard.writeText(vehicle.plate);
                      toast({ description: `Placa ${vehicle.plate} copiada!` });
                    }}
                  >
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

              {!masked && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saldo Atual</p>
                  <BalanceIndicator balance={vehicle.balance} size="lg" className="text-xl px-4 py-1.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar-thin space-y-6">

          {/* Maintenance Alert Section */}
          {isInMaintenance && maintenanceRecord && (
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 sm:p-5 shadow-[0_0_24px_-8px_hsl(48_96%_50%/0.4)]">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-400/20 border border-yellow-400/40 shrink-0">
                  <Wrench className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-yellow-100 uppercase tracking-wider">
                      Veículo em Manutenção
                    </h4>
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                  </div>
                  <p className="text-xs text-yellow-100/80 mb-3">
                    Este veículo está atualmente na oficina e indisponível para operação.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-background/40 border border-yellow-400/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3 h-3 text-yellow-300" />
                        <span className="text-[10px] uppercase tracking-wider text-yellow-200/80 font-semibold">
                          Data de Entrada na Oficina
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(maintenanceRecord.workshop_entry_date) ?? '—'}
                      </p>
                    </div>

                    {maintenanceRecord.os_number != null && (
                      <div className="rounded-lg bg-background/40 border border-yellow-400/20 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ClipboardIcon />
                          <span className="text-[10px] uppercase tracking-wider text-yellow-200/80 font-semibold">
                            Nº O.S.
                          </span>
                        </div>
                        <p className="text-sm font-mono font-semibold text-foreground">
                          {maintenanceRecord.os_number}
                        </p>
                      </div>
                    )}
                  </div>

                  {maintenanceRecord.identified_problems && (
                    <div className="mt-3 rounded-lg bg-background/40 border border-yellow-400/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3 h-3 text-yellow-300" />
                        <span className="text-[10px] uppercase tracking-wider text-yellow-200/80 font-semibold">
                          Problemas Identificados
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                        {maintenanceRecord.identified_problems}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Column 1: Vehicle Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Activity className="w-3 h-3" /> Especificações
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <DetailRow icon={Car} label="Tipo de Frota" value={vehicle.fleet_type} />
                <DetailRow icon={Fuel} label="Combustível" value={vehicle.fuel_type} />
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
        <div className="p-4 bg-surface-overlay border-t border-border/20 flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant={isInMaintenance ? 'default' : 'outline'}
            className={cn(
              "gap-2 transition-all",
              isInMaintenance
                ? "bg-yellow-500/90 hover:bg-yellow-500 text-yellow-950 border-yellow-400"
                : "border-border/40"
            )}
            onClick={() => setMaintenanceModalOpen(true)}
          >
            <Wrench className="w-4 h-4" />
            {isInMaintenance ? 'Ver no GPM Manutenção' : 'Abrir GPM Manutenção'}
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Button>
        </div>

      </DialogContent>

      {/* GPM Maintenance Modal */}
      <MaintenanceModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
        vehicles={[...allVehicles, ...undefinedVehicles]}
        coordinations={coordinations}
        selectedCoordinations={[]}
        defaultTab={isInMaintenance ? 'panel' : 'request'}
      />
    </Dialog>
  );
}

function ClipboardIcon() {
  return <Wrench className="w-3 h-3 text-yellow-300" />;
}
