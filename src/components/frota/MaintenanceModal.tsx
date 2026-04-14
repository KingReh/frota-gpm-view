import { useState, useMemo } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Wrench, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NativePlateSelect } from './NativePlateSelect';
import { useVehicleMaintenance } from '@/hooks/useVehicleMaintenance';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { VehicleWithDetails, Coordination } from '@/types/vehicle';

interface MaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleWithDetails[];
  coordinations: Coordination[];
  selectedCoordinations: string[];
}

export function MaintenanceModal({
  open,
  onOpenChange,
  vehicles,
  coordinations,
  selectedCoordinations,
}: MaintenanceModalProps) {
  const { records, isLoading, add, isAdding, update, remove } = useVehicleMaintenance();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Form state
  const [selectedPlate, setSelectedPlate] = useState('');
  const [osNumber, setOsNumber] = useState('');
  const [requestedDate, setRequestedDate] = useState<Date>();
  const [requestedDateOpen, setRequestedDateOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    if (selectedCoordinations.length === 0) return vehicles;
    return vehicles.filter(
      (v) => v.coordination && selectedCoordinations.includes(v.coordination.id)
    );
  }, [vehicles, selectedCoordinations]);

  const plates = useMemo(
    () => filteredVehicles.map((v) => v.plate).sort(),
    [filteredVehicles]
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.plate === selectedPlate),
    [vehicles, selectedPlate]
  );

  const isProprio = selectedVehicle?.fleet_type === 'PROPRIO';

  const resetForm = () => {
    setSelectedPlate('');
    setOsNumber('');
    setRequestedDate(undefined);
  };

  const handleAdd = async () => {
    if (!selectedPlate || !requestedDate) return;
    try {
      await add({
        plate: selectedPlate,
        fleet_type: selectedVehicle?.fleet_type ?? null,
        model: selectedVehicle?.model ?? null,
        os_number: isProprio && osNumber ? parseInt(osNumber, 10) : null,
        requested_date: format(requestedDate, 'yyyy-MM-dd'),
      });
      toast({ title: 'Veículo adicionado à manutenção!' });
      resetForm();
    } catch {
      toast({ title: 'Erro ao registrar', variant: 'destructive' });
    }
  };

  const handleDateUpdate = async (
    id: string,
    field: 'gad_service_date' | 'workshop_entry_date',
    date: Date | undefined
  ) => {
    try {
      await update({
        id,
        [field]: date ? format(date, 'yyyy-MM-dd') : null,
      });
    } catch {
      toast({ title: 'Erro ao atualizar data', variant: 'destructive' });
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await remove(id);
      toast({ title: 'Veículo retornou da oficina!' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const getDaysInWorkshop = (entryDate: string | null) => {
    if (!entryDate) return null;
    const days = differenceInDays(new Date(), parseISO(entryDate));
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            GPM Manutenção
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="request" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="request" className="text-xs gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" />
              Solicitação
            </TabsTrigger>
            <TabsTrigger value="panel" className="text-xs gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              Painel Geral
            </TabsTrigger>
          </TabsList>

          {/* Tab 1 - Solicitação */}
          <TabsContent value="request" className="space-y-4 mt-4">
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
              {/* Vehicle select */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Veículo</Label>
                {isMobile ? (
                  <NativePlateSelect
                    value={selectedPlate}
                    onChange={setSelectedPlate}
                    plates={plates}
                    placeholder="Selecione o veículo..."
                  />
                ) : (
                  <Select value={selectedPlate} onValueChange={setSelectedPlate}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Selecione o veículo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {plates.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedVehicle && (
                  <p className="text-[10px] text-muted-foreground">
                    {selectedVehicle.model} • {selectedVehicle.fleet_type}
                  </p>
                )}
              </div>

              {/* OS Number - only for PROPRIO */}
              {isProprio && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">OS (Ordem de Serviço)</Label>
                  <Input
                    type="number"
                    value={osNumber}
                    onChange={(e) => setOsNumber(e.target.value)}
                    placeholder="Número da OS"
                    className="h-9 text-xs bg-background"
                  />
                </div>
              )}

              {/* Requested Date */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data Solicitada à GAD</Label>
                <Popover open={requestedDateOpen} onOpenChange={setRequestedDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-9 justify-start text-left text-xs font-normal bg-background',
                        !requestedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {requestedDate
                        ? format(requestedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={requestedDate}
                      onSelect={(d) => {
                        setRequestedDate(d);
                        setRequestedDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit */}
              <Button
                onClick={handleAdd}
                disabled={!selectedPlate || !requestedDate || isAdding}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2 - Painel Geral */}
          <TabsContent value="panel" className="mt-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum veículo em manutenção.
              </p>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => {
                  const days = getDaysInWorkshop(rec.workshop_entry_date);
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-border bg-muted/30 space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{rec.plate}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {rec.model ?? '—'} • {rec.fleet_type ?? '—'}
                            {rec.os_number ? ` • OS ${rec.os_number}` : ''}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Solicitado: {format(parseISO(rec.requested_date), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      {/* Date fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DateField
                          label="Data Atendimento GAD"
                          value={rec.gad_service_date}
                          onChange={(d) => handleDateUpdate(rec.id, 'gad_service_date', d)}
                        />
                        <DateField
                          label="Data Entrada Oficina"
                          value={rec.workshop_entry_date}
                          onChange={(d) => handleDateUpdate(rec.id, 'workshop_entry_date', d)}
                        />
                      </div>

                      {/* Workshop time + Return */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <div>
                          {days !== null ? (
                            <p className="text-xs font-medium text-[hsl(var(--balance-medium))]">
                              Veículo há {days} {days === 1 ? 'dia' : 'dias'} na oficina
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground italic">
                              Aguardando entrada na oficina
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground cursor-pointer">
                            Retorno
                          </Label>
                          <Checkbox onCheckedChange={() => handleReturn(rec.id)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Reusable inline date picker field */
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parseISO(value) : undefined;

  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full h-8 justify-start text-left text-[11px] font-normal bg-background',
              !parsed && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-1.5 h-3 w-3" />
            {parsed ? format(parsed, 'dd/MM/yyyy') : 'Selecionar'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsed}
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
