import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehicleDetailModal } from './VehicleDetailModal';
import { CoordinationBadge } from './CoordinationBadge';
import type { VehicleWithDetails } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { parseBalance } from '@/lib/balance';
import { isBalanceMasked } from '@/lib/maskedPlates';
import { simplifyFuelType } from '@/lib/fuel';
import {
  Car,
  Info,
  Star,
  Wrench,
  Copy,
  Check,
  Fuel,
  ChevronRight,
} from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  addYears,
  addMonths,
  parseISO,
  isValid,
} from 'date-fns';

interface VehicleTableProps {
  vehicles: VehicleWithDetails[];
  maintenancePlates?: Set<string>;
  maintenanceEntryDates?: Record<string, string | null>;
}

function formatDaysSince(iso: string | null | undefined): string {
  if (!iso) return 'data indisponível';

  let entry: Date;
  if (iso instanceof Date) {
    entry = iso;
  } else if (typeof iso === 'string') {
    entry = parseISO(iso);
    if (!isValid(entry)) entry = new Date(iso);
  } else {
    entry = new Date(iso);
  }

  if (!isValid(entry) || isNaN(entry.getTime())) return 'data indisponível';

  const now = new Date();
  if (entry > now) return 'menos de 1 dia';

  const years = differenceInYears(now, entry);
  const afterYears = addYears(entry, years);

  const months = differenceInMonths(now, afterYears);
  const afterMonths = addMonths(afterYears, months);

  const days = differenceInDays(now, afterMonths);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

  if (parts.length === 0) return 'menos de 1 dia';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

export function VehicleTable({
  vehicles,
  maintenancePlates,
  maintenanceEntryDates,
}: VehicleTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);
  const [copiedPlate, setCopiedPlate] = useState<string | null>(null);
  const { preferences, toggleFavorite } = useUserPreferences();
  const { toast } = useToast();

  const operationalStats = useMemo(() => {
    let inMaintenance = 0;
    for (const v of vehicles) {
      if (maintenancePlates?.has(v.plate)) {
        inMaintenance++;
      }
    }
    return {
      total: vehicles.length,
      inMaintenance,
      operational: Math.max(0, vehicles.length - inMaintenance),
    };
  }, [vehicles, maintenancePlates]);

  const handleCopyPlate = (plate: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(plate);
    setCopiedPlate(plate);
    setTimeout(() => setCopiedPlate((prev) => (prev === plate ? null : prev)), 1600);
    toast({ description: `Placa ${plate} copiada!` });
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl mx-0">
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Car className="w-8 h-8 text-primary opacity-80" />
        </div>
        <p className="text-lg font-bold text-foreground tracking-tight">Nenhum veículo encontrado</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
          Não há registros para os filtros selecionados. Tente ajustar os parâmetros de busca.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden backdrop-blur-xl border border-border/70 shadow-2xl bg-card/85 mx-0 transition-all duration-300">
        {/* Table Top Context Toolbar (8-pt aligned: p-4 = 16px, gap-4 = 16px) */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between gap-4 flex-wrap bg-muted/20">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Frota em Tabela
              </span>
            </div>

            <Badge
              variant="secondary"
              className="bg-muted/60 text-muted-foreground border border-border/60 text-xs px-2.5 py-0.5 font-mono rounded-md"
            >
              {operationalStats.total} {operationalStats.total === 1 ? 'veículo' : 'veículos'}
            </Badge>

            <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {operationalStats.operational} em operação
            </span>

            {operationalStats.inMaintenance > 0 && (
              <span className="text-xs text-amber-400 font-medium inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                {operationalStats.inMaintenance} em manutenção
              </span>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground hidden md:block">
            Clique na linha para ver ficha completa
          </div>
        </div>

        {/* Responsive Table: Zero horizontal scroll on mobile, full grid on desktop */}
        <div className="w-full overflow-x-hidden md:overflow-x-auto scrollbar-hide">
          <Table className="w-full border-collapse text-left">
            <TableHeader>
              <TableRow className="border-b border-border/70 hover:bg-transparent bg-muted/40">
                {/* Column 1: Veículo (Adapts gracefully, reduced width on mobile) */}
                <TableHead className="py-3 px-2 sm:px-4 sm:pl-6 text-xs uppercase tracking-wider font-bold text-muted-foreground w-[54%] sm:w-auto max-w-[192px] sm:max-w-none">
                  Veículo
                </TableHead>

                {/* Column 2: Lotação / Unidade (Visible on md+) */}
                <TableHead className="hidden md:table-cell py-3 px-4 text-xs uppercase tracking-wider font-bold text-muted-foreground w-[160px]">
                  Lotação / Unidade
                </TableHead>

                {/* Column 3: Combustível & Tipo (Visible on lg+) */}
                <TableHead className="hidden lg:table-cell py-3 px-4 text-xs uppercase tracking-wider font-bold text-muted-foreground w-[152px]">
                  Combustível / Frota
                </TableHead>

                {/* Column 4: Status Operacional (Visible on md+) */}
                <TableHead className="hidden md:table-cell py-3 px-4 text-xs uppercase tracking-wider font-bold text-muted-foreground w-[136px]">
                  Status
                </TableHead>

                {/* Column 5: Limite Próx. Período (Visible on xl+) */}
                <TableHead className="hidden xl:table-cell py-3 px-4 text-xs uppercase tracking-wider font-bold text-muted-foreground text-right w-[152px]">
                  Limite Período
                </TableHead>

                {/* Column 6: Saldo Atual (Always Visible, Compact on Mobile) */}
                <TableHead className="py-3 px-2 sm:px-4 text-xs uppercase tracking-wider font-bold text-muted-foreground text-right w-[46%] sm:w-[160px] md:w-[184px]">
                  Saldo
                </TableHead>

                {/* Column 7: Ações Rápidas (Desktop Only) */}
                <TableHead className="hidden md:table-cell py-3 pr-4 sm:pr-6 pl-2 text-xs uppercase tracking-wider font-bold text-muted-foreground text-right w-[72px]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vehicles.map((vehicle, index) => {
                const balanceValue = parseBalance(vehicle.balance);
                const limitValue =
                  parseBalance(vehicle.current_limit) ||
                  parseBalance(vehicle.next_period_limit) ||
                  1000;
                const percentRemaining =
                  limitValue > 0
                    ? Math.min(100, Math.max(0, (balanceValue / limitValue) * 100))
                    : 0;

                const isFavorite = preferences.favoritePlates?.includes(vehicle.plate);
                const isInMaintenance = maintenancePlates?.has(vehicle.plate);
                const maintenanceEntryDate = maintenanceEntryDates?.[vehicle.plate];
                const isMasked = isBalanceMasked(vehicle.plate);
                const isCopied = copiedPlate === vehicle.plate;

                // Semantic balance color coding
                const balanceTextColor =
                  balanceValue <= 0
                    ? 'text-rose-400'
                    : balanceValue < 150
                    ? 'text-amber-400'
                    : 'text-foreground';

                const balanceBarColor =
                  balanceValue <= 0
                    ? 'bg-rose-500'
                    : balanceValue < 150
                    ? 'bg-amber-400'
                    : 'bg-primary';

                return (
                  <TableRow
                    key={vehicle.plate}
                    style={
                      index < 24
                        ? { animationDelay: `${Math.min(index * 16, 240)}ms` }
                        : undefined
                    }
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={cn(
                      'group border-b border-border/40 transition-all duration-200 cursor-pointer select-none',
                      index % 2 === 0 ? 'bg-transparent' : 'bg-muted/[0.12]',
                      'hover:bg-muted/40 active:bg-muted/60',
                      index < 24 &&
                        'animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-backwards'
                    )}
                  >
                    {/* Cell 1: Veículo & Identificação Principal (Clean & Compact on Mobile) */}
                    <TableCell className="py-2.5 md:py-4 px-2 sm:px-4 sm:pl-6 relative max-w-[192px] sm:max-w-none">
                      {/* Left Active Indicator Bar */}
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {/* Favorite Button (Desktop Only to save mobile space) */}
                        <div className="hidden md:block shrink-0">
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    'h-8 w-8 rounded-lg transition-all shrink-0 p-0',
                                    isFavorite
                                      ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                                      : 'text-muted-foreground/40 hover:text-amber-400 hover:bg-muted/60 opacity-0 group-hover:opacity-100 focus:opacity-100'
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(vehicle.plate);
                                  }}
                                  aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                >
                                  <Star
                                    className={cn(
                                      'h-4 w-4',
                                      isFavorite && 'fill-current'
                                    )}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs font-semibold">
                                {isFavorite ? 'Favoritado' : 'Favoritar veículo'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Thumbnail: 48x32px on Mobile (8-pt: 6*8 x 4*8), 64x40px on Desktop */}
                        <div className="relative w-12 h-8 md:w-16 md:h-10 rounded-lg border border-border/70 bg-black/20 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                          <div
                            className="absolute inset-0 pointer-events-none opacity-80"
                            style={{ background: 'var(--vehicle-contrast-bg)' }}
                          />

                          {vehicle.image_url ? (
                            <img
                              src={vehicle.image_url}
                              alt={`Veículo ${vehicle.plate}`}
                              className="vehicle-themed-image max-h-full max-w-full object-contain p-0.5 filter group-hover:scale-105 transition-transform duration-300 ease-out"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <Car className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/40" />
                          )}

                          {isInMaintenance && (
                            <div
                              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-background animate-pulse"
                              title="Em manutenção"
                            />
                          )}
                        </div>

                        {/* Text Stack: Placa, Modelo, Subtitle */}
                        <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Plate Copy Button with Interactive Feedback */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyPlate(vehicle.plate, e)}
                              title="Clique para copiar a placa"
                              className={cn(
                                'font-mono font-bold tracking-wider text-[11px] md:text-xs px-1.5 md:px-2 py-0.5 rounded border transition-all duration-200 inline-flex items-center gap-1 shrink-0 cursor-pointer',
                                isCopied
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                  : 'bg-muted/60 border-border/70 text-foreground hover:border-primary/50 hover:bg-primary/10'
                              )}
                            >
                              <span>{vehicle.plate}</span>
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-80 shrink-0" />
                              )}
                            </button>

                            {/* Mobile Maintenance Tag (Only on Mobile) */}
                            {isInMaintenance && (
                              <span className="md:hidden inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Wrench className="w-2.5 h-2.5" />
                                <span>Manut.</span>
                              </span>
                            )}
                          </div>

                          {/* Model */}
                          <span className="text-xs md:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate block">
                            {vehicle.model || 'Modelo não informado'}
                          </span>

                          {/* Subtitle: Coordination or Manufacturer */}
                          {(() => {
                            const coordName = typeof vehicle.coordination === 'object' && vehicle.coordination !== null
                              ? (typeof vehicle.coordination.name === 'string' ? vehicle.coordination.name : '')
                              : typeof vehicle.coordination === 'string'
                              ? vehicle.coordination
                              : '';
                            const manufacturer = typeof vehicle.manufacturer === 'string' ? vehicle.manufacturer : '';
                            const description = typeof vehicle.description === 'string' ? vehicle.description : '';

                            return (
                              <span className="text-[10px] md:text-[11px] text-muted-foreground truncate block">
                                {coordName ? (
                                  <span className="md:hidden font-medium text-foreground/70">
                                    {coordName} •{' '}
                                  </span>
                                ) : null}
                                {manufacturer}
                                {description ? ` • ${description}` : ''}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </TableCell>

                    {/* Cell 2: Lotação / Coordenação (Hidden on Mobile) */}
                    <TableCell className="hidden md:table-cell py-4 px-4">
                      {vehicle.coordination ? (
                        <CoordinationBadge coordination={vehicle.coordination} compact />
                      ) : (
                        <span className="text-muted-foreground/60 text-xs font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Cell 3: Combustível & Frota (Hidden on Mobile & Tablet) */}
                    <TableCell className="hidden lg:table-cell py-4 px-4">
                      <div className="space-y-1 min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground truncate">
                          <Fuel className="w-3.5 h-3.5 text-accent-fuel shrink-0" />
                          <span className="truncate">{simplifyFuelType(vehicle.fuel_type)}</span>
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate uppercase font-medium">
                          {vehicle.fleet_type || 'Geral'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cell 4: Status Operacional (Hidden on Mobile) */}
                    <TableCell className="hidden md:table-cell py-4 px-4">
                      {isInMaintenance ? (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Manutenção</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-zinc-900 text-amber-200 border border-amber-400/50 text-xs font-semibold shadow-xl"
                            >
                              Inoperante há {formatDaysSince(maintenanceEntryDate)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Em Operação</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Cell 5: Limite Próx. Período (Hidden on screens < xl) */}
                    <TableCell className="hidden xl:table-cell py-4 px-4 text-right">
                      {vehicle.next_period_limit ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-semibold text-foreground/80 block">
                            {parseBalance(vehicle.next_period_limit).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">
                            Próx. Ciclo
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Cell 6: Saldo Atual (Always Visible, Compact on Mobile) */}
                    <TableCell className="py-2.5 md:py-4 px-2 sm:px-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={cn(
                              'font-mono font-black text-xs md:text-sm tracking-tight',
                              balanceTextColor
                            )}
                          >
                            {isMasked
                              ? '••••••'
                              : balanceValue.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                          </span>
                          {/* Subtle arrow indicator for mobile row tap */}
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 md:hidden shrink-0" />
                        </div>

                        {/* Progress Bar (Desktop & Tablet) */}
                        {!isMasked && limitValue > 0 && (
                          <div className="hidden sm:block w-16 md:w-24 h-1 bg-muted/60 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={cn('h-full rounded-full transition-all duration-300', balanceBarColor)}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Cell 7: Ações Rápidas (Desktop Only) */}
                    <TableCell className="hidden md:table-cell py-4 pr-4 sm:pr-6 pl-2 text-right">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/60 transition-all shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVehicle(vehicle);
                              }}
                              aria-label="Ver ficha completa do veículo"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs font-semibold">
                            Ver detalhes completos
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </>
  );
}
