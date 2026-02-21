import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useGestorFrota } from '@/hooks/useGestorFrota';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  formatPhoneForWhatsApp,
  openWhatsApp,
  openEmail,
  getGreeting,
  formatValueBR,
} from '@/lib/whatsapp';
import { parseBalance } from '@/lib/balance';
import { NativePlateSelect } from './NativePlateSelect';
import type { VehicleWithDetails, Coordination } from '@/types/vehicle';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Send,
  ArrowLeftRight,
  CircleDollarSign,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferItem {
  fromPlate: string;
  toPlate: string;
  value: string;
}

interface BalanceRequestItem {
  plate: string;
  value: string;
}

interface TransferRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleWithDetails[];
  coordinations: Coordination[];
  selectedCoordinations: string[];
}

const emptyTransfer = (): TransferItem => ({ fromPlate: '', toPlate: '', value: '' });
const emptyBalanceRequest = (): BalanceRequestItem => ({ plate: '', value: '' });

function parseMonetaryInput(raw: string): number {
  const cleaned = raw.replace(/[^\d,]/g, '').replace(',', '.');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/** Tiny inline component showing current → projected balance */
function BalanceFeedback({
  plate,
  vehicles,
  delta,
}: {
  plate: string;
  vehicles: VehicleWithDetails[];
  delta: number;
}) {
  if (!plate) return <div className="h-[18px]" />;
  const vehicle = vehicles.find((v) => v.plate === plate);
  const current = vehicle ? parseBalance(vehicle.balance) : 0;
  const projected = current + delta;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const projectedStr = fmt(projected);
  const currentStr = fmt(current);
  const status = projected >= 200 ? 'high' : projected >= 100 ? 'medium' : 'low';
  const statusColor = {
    high: 'text-[hsl(var(--balance-high))]',
    medium: 'text-[hsl(var(--balance-medium))]',
    low: 'text-[hsl(var(--balance-low))]',
  };

  return (
    <div className="flex items-center gap-1 h-[18px]">
      <span className="text-[10px] text-muted-foreground">{currentStr}</span>
      {delta !== 0 && (
        <>
          <span className="text-[10px] text-muted-foreground">→</span>
          <span className={cn('text-[10px] font-semibold', statusColor[status])}>
            {projectedStr}
          </span>
        </>
      )}
    </div>
  );
}

type BlockOrder = 'transfer-first' | 'balance-first';

/** Block header with drag handle (desktop) or arrow button (mobile) */
function DraggableBlockHeader({
  blockId,
  title,
  icon: Icon,
  canReorder,
  isMobile,
  isFirst,
  onSwap,
  onDragStart,
  onDragEnd,
}: {
  blockId: string;
  title: string;
  icon: React.ElementType;
  canReorder: boolean;
  isMobile: boolean;
  isFirst: boolean;
  onSwap: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      draggable={canReorder && !isMobile}
      onDragStart={canReorder && !isMobile ? onDragStart : undefined}
      onDragEnd={canReorder && !isMobile ? onDragEnd : undefined}
    >
      {canReorder && !isMobile && (
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground cursor-grab shrink-0" />
      )}
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
        {title}
      </p>
      {canReorder && isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={onSwap}
        >
          {isFirst ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
        </Button>
      )}
    </div>
  );
}

export function TransferRequestModal({
  open,
  onOpenChange,
  vehicles,
  coordinations,
  selectedCoordinations,
}: TransferRequestModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [wantTransfer, setWantTransfer] = useState(false);
  const [wantBalance, setWantBalance] = useState(false);
  const [transfers, setTransfers] = useState<TransferItem[]>([emptyTransfer()]);
  const [balanceRequests, setBalanceRequests] = useState<BalanceRequestItem[]>([emptyBalanceRequest()]);
  const [userName, setUserName] = useLocalStorage<string>('frota-gpm-requester-name', '');
  const [blockOrder, setBlockOrder] = useState<BlockOrder>('transfer-first');
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: gestor } = useGestorFrota();
  const isMobile = useIsMobile();

  const plates = useMemo(
    () => vehicles.map((v) => v.plate).sort(),
    [vehicles]
  );

  const coordName = useMemo(() => {
    if (selectedCoordinations.length === 0) return 'GPM';
    const coord = coordinations.find((c) => c.id === selectedCoordinations[0]);
    return coord?.name || 'GPM';
  }, [coordinations, selectedCoordinations]);

  // Separate deltas per section so they don't interfere
  const transferDeltas = useMemo(() => {
    const deltas: Record<string, number> = {};
    transfers.forEach((t) => {
      const val = parseMonetaryInput(t.value);
      if (val > 0 && t.fromPlate) {
        deltas[t.fromPlate] = (deltas[t.fromPlate] || 0) - val;
      }
      if (val > 0 && t.toPlate) {
        deltas[t.toPlate] = (deltas[t.toPlate] || 0) + val;
      }
    });
    return deltas;
  }, [transfers]);

  const balanceDeltas = useMemo(() => {
    const deltas: Record<string, number> = {};
    balanceRequests.forEach((b) => {
      const val = parseMonetaryInput(b.value);
      if (val > 0 && b.plate) {
        deltas[b.plate] = (deltas[b.plate] || 0) + val;
      }
    });
    return deltas;
  }, [balanceRequests]);

  const combinedDeltas = useMemo(() => {
    const deltas: Record<string, number> = { ...transferDeltas };
    Object.entries(balanceDeltas).forEach(([plate, val]) => {
      deltas[plate] = (deltas[plate] || 0) + val;
    });
    return deltas;
  }, [transferDeltas, balanceDeltas]);

  const resetForm = useCallback(() => {
    setStep(1);
    setWantTransfer(false);
    setWantBalance(false);
    setTransfers([emptyTransfer()]);
    setBalanceRequests([emptyBalanceRequest()]);
    setBlockOrder('transfer-first');
    setDraggingBlock(null);
  }, []);

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  // --- Step 1 validation ---
  const step1Valid = useMemo(() => {
    if (!wantTransfer && !wantBalance) return false;
    if (wantTransfer) {
      const hasValid = transfers.some(
        (t) => t.fromPlate && t.toPlate && t.fromPlate !== t.toPlate && parseMonetaryInput(t.value) > 0
      );
      if (!hasValid) return false;
    }
    if (wantBalance) {
      const hasValid = balanceRequests.some(
        (b) => b.plate && parseMonetaryInput(b.value) > 0
      );
      if (!hasValid) return false;
    }
    return true;
  }, [wantTransfer, wantBalance, transfers, balanceRequests]);

  // --- Build message lines helpers ---
  const buildTransferLines = useCallback((lines: string[]) => {
    if (!wantTransfer) return;
    const validTransfers = transfers.filter(
      (t) => t.fromPlate && t.toPlate && t.fromPlate !== t.toPlate && parseMonetaryInput(t.value) > 0
    );
    if (validTransfers.length > 0) {
      lines.push('');
      lines.push('Transferência entre veículos:');
      validTransfers.forEach((t) => {
        const val = formatValueBR(parseMonetaryInput(t.value));
        lines.push(`(${t.fromPlate} = ${val}) para ${t.toPlate}`);
      });
    }
  }, [wantTransfer, transfers]);

  const buildBalanceLines = useCallback((lines: string[]) => {
    if (!wantBalance) return;
    const validRequests = balanceRequests.filter(
      (b) => b.plate && parseMonetaryInput(b.value) > 0
    );
    if (validRequests.length > 0) {
      lines.push('');
      lines.push('Solicitação de Saldo:');
      validRequests.forEach((b) => {
        const val = formatValueBR(parseMonetaryInput(b.value));
        lines.push(`${b.plate} = ${val}`);
      });
    }
  }, [wantBalance, balanceRequests]);

  // --- Build message respecting block order ---
  const formattedMessage = useMemo(() => {
    if (!gestor) return '';
    const greeting = getGreeting();
    const lines: string[] = [];
    lines.push(`${greeting}, ${gestor.name}!`);
    lines.push('');
    lines.push(
      `Me chamo ${userName.trim() || '___'} da coordenação ${coordName} e gostaria de solicitar uma transferência de combustível para minha frota da seguinte forma:`
    );

    const sections = blockOrder === 'transfer-first'
      ? [buildTransferLines, buildBalanceLines]
      : [buildBalanceLines, buildTransferLines];
    sections.forEach((fn) => fn(lines));

    return lines.join('\n');
  }, [gestor, userName, coordName, blockOrder, buildTransferLines, buildBalanceLines]);

  // --- Actions ---
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      toast({ title: 'Mensagem copiada!' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const handleSend = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
    } catch {}

    if (gestor.status_telefone) {
      try {
        const phone = formatPhoneForWhatsApp(gestor.telefone);
        openWhatsApp(phone, formattedMessage);
        toast({ title: 'WhatsApp aberto!', description: 'A mensagem também foi copiada.' });
      } catch {
        toast({
          title: 'Erro ao abrir WhatsApp',
          description: 'A mensagem foi copiada para a área de transferência.',
          variant: 'destructive',
        });
      }
    } else if (gestor.status_email) {
      openEmail(gestor.email, 'Solicitação de Transferência de Combustível', formattedMessage);
      toast({ title: 'E-mail aberto!', description: 'A mensagem também foi copiada.' });
    } else {
      toast({
        title: 'Nenhum canal disponível',
        description:
          'Não foi possível enviar. Entre em contato com o gestor pelos canais alternativos.',
        variant: 'destructive',
      });
    }
  };

  // --- Transfer list helpers ---
  const updateTransfer = (idx: number, field: keyof TransferItem, value: string) => {
    if (field === 'value') {
      const numVal = parseMonetaryInput(value);
      const currentTransfer = transfers[idx];
      if (numVal > 0 && currentTransfer.fromPlate) {
        const vehicle = vehicles.find((v) => v.plate === currentTransfer.fromPlate);
        const currentBalance = vehicle ? parseBalance(vehicle.balance) : 0;
        const otherDeltas = transfers.reduce((acc, t, i) => {
          if (i === idx) return acc;
          const v = parseMonetaryInput(t.value);
          if (v > 0 && t.fromPlate === currentTransfer.fromPlate) return acc - v;
          if (v > 0 && t.toPlate === currentTransfer.fromPlate) return acc + v;
          return acc;
        }, 0);
        const balanceDeltaForOrigin = balanceDeltas[currentTransfer.fromPlate] || 0;
        if (currentBalance + otherDeltas + balanceDeltaForOrigin - numVal < 0) {
          toast({
            title: 'Valor inválido',
            description: `O veículo ${currentTransfer.fromPlate} ficaria com saldo negativo. Saldo disponível: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance + otherDeltas + balanceDeltaForOrigin)}`,
            variant: 'destructive',
          });
          return;
        }
      }
    }
    setTransfers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const addTransfer = () => setTransfers((prev) => [...prev, emptyTransfer()]);
  const removeTransfer = (idx: number) =>
    setTransfers((prev) => (prev.length <= 1 ? [emptyTransfer()] : prev.filter((_, i) => i !== idx)));

  // --- Balance request list helpers ---
  const updateBalanceReq = (idx: number, field: keyof BalanceRequestItem, value: string) => {
    setBalanceRequests((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const addBalanceReq = () => setBalanceRequests((prev) => [...prev, emptyBalanceRequest()]);
  const removeBalanceReq = (idx: number) =>
    setBalanceRequests((prev) => (prev.length <= 1 ? [emptyBalanceRequest()] : prev.filter((_, i) => i !== idx)));

  // --- Drag-and-drop handlers ---
  const canReorder = wantTransfer && wantBalance;

  const handleDragStart = (blockId: string) => (e: React.DragEvent) => {
    setDraggingBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetBlockId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceBlockId = e.dataTransfer.getData('text/plain');
    setDraggingBlock(null);
    if (sourceBlockId !== targetBlockId) {
      setBlockOrder((prev) =>
        prev === 'transfer-first' ? 'balance-first' : 'transfer-first'
      );
    }
  };

  const handleDragEnd = () => {
    setDraggingBlock(null);
  };

  const swapOrder = () => {
    setBlockOrder((prev) =>
      prev === 'transfer-first' ? 'balance-first' : 'transfer-first'
    );
  };

  // (DraggableBlockHeader is now a top-level component)

  // --- Transfer block JSX ---
  const transferBlock = wantTransfer ? (
    <div
      key="transfer"
      className={cn(
        "space-y-3 p-3 rounded-xl border border-border bg-muted/30 transition-all",
        draggingBlock === 'transfer' && 'opacity-50',
        draggingBlock && draggingBlock !== 'transfer' && 'border-dashed border-primary'
      )}
      onDragOver={canReorder ? handleDragOver : undefined}
      onDrop={canReorder ? handleDrop('transfer') : undefined}
    >
      <DraggableBlockHeader
        blockId="transfer"
        title="Transferências"
        icon={ArrowLeftRight}
        canReorder={canReorder}
        isMobile={isMobile}
        isFirst={blockOrder === 'transfer-first'}
        onSwap={swapOrder}
        onDragStart={handleDragStart('transfer')}
        onDragEnd={handleDragEnd}
      />
      {transfers.map((t, idx) => (
        <div key={idx} className="flex flex-row gap-1.5 items-end">
          <div className="flex-1 min-w-0">
            <Label className="text-[10px] text-muted-foreground">Origem</Label>
            {isMobile ? (
              <NativePlateSelect
                value={t.fromPlate}
                onChange={(v) => updateTransfer(idx, 'fromPlate', v)}
                plates={plates}
                placeholder="Selecione..."
              />
            ) : (
              <Select value={t.fromPlate} onValueChange={(v) => updateTransfer(idx, 'fromPlate', v)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {plates.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <BalanceFeedback plate={t.fromPlate} vehicles={vehicles} delta={combinedDeltas[t.fromPlate] || 0} />
          </div>
          <div className="w-20 sm:w-24 shrink-0">
            <Label className="text-[10px] text-muted-foreground">Valor</Label>
            <Input
              className="h-9 text-xs bg-background"
              placeholder="0,00"
              inputMode="decimal"
              value={t.value}
              onChange={(e) => updateTransfer(idx, 'value', e.target.value)}
            />
            <div className="h-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <Label className="text-[10px] text-muted-foreground">Destino</Label>
            {isMobile ? (
              <NativePlateSelect
                value={t.toPlate}
                onChange={(v) => updateTransfer(idx, 'toPlate', v)}
                plates={plates.filter((p) => p !== t.fromPlate)}
                placeholder="Selecione..."
                className={cn(t.fromPlate && t.toPlate && t.fromPlate === t.toPlate && 'border-destructive')}
              />
            ) : (
              <Select value={t.toPlate} onValueChange={(v) => updateTransfer(idx, 'toPlate', v)}>
                <SelectTrigger className={cn("h-9 text-xs bg-background", t.fromPlate && t.toPlate && t.fromPlate === t.toPlate && "border-destructive")}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {plates.filter((p) => p !== t.fromPlate).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <BalanceFeedback plate={t.toPlate} vehicles={vehicles} delta={combinedDeltas[t.toPlate] || 0} />
          </div>
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => removeTransfer(idx)}
              disabled={transfers.length <= 1 && !transfers[0].fromPlate && !transfers[0].toPlate && !transfers[0].value}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="h-[18px]" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={addTransfer}>
        <Plus className="w-3 h-3" /> Adicionar transferência
      </Button>
    </div>
  ) : null;

  // --- Balance block JSX ---
  const balanceBlock = wantBalance ? (
    <div
      key="balance"
      className={cn(
        "space-y-3 p-3 rounded-xl border border-border bg-muted/30 transition-all",
        draggingBlock === 'balance' && 'opacity-50',
        draggingBlock && draggingBlock !== 'balance' && 'border-dashed border-primary'
      )}
      onDragOver={canReorder ? handleDragOver : undefined}
      onDrop={canReorder ? handleDrop('balance') : undefined}
    >
      <DraggableBlockHeader
        blockId="balance"
        title="Solicitações de Saldo"
        icon={CircleDollarSign}
        canReorder={canReorder}
        isMobile={isMobile}
        isFirst={blockOrder === 'balance-first'}
        onSwap={swapOrder}
        onDragStart={handleDragStart('balance')}
        onDragEnd={handleDragEnd}
      />
      {balanceRequests.map((b, idx) => (
        <div key={idx} className="flex flex-row gap-1.5 items-end">
          <div className="flex-1 min-w-0">
            <Label className="text-[10px] text-muted-foreground">Veículo</Label>
            {isMobile ? (
              <NativePlateSelect
                value={b.plate}
                onChange={(v) => updateBalanceReq(idx, 'plate', v)}
                plates={plates}
                placeholder="Selecione..."
              />
            ) : (
              <Select value={b.plate} onValueChange={(v) => updateBalanceReq(idx, 'plate', v)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {plates.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <BalanceFeedback plate={b.plate} vehicles={vehicles} delta={combinedDeltas[b.plate] || 0} />
          </div>
          <div className="w-20 sm:w-24 shrink-0">
            <Label className="text-[10px] text-muted-foreground">Valor</Label>
            <Input
              className="h-9 text-xs bg-background"
              placeholder="0,00"
              inputMode="decimal"
              value={b.value}
              onChange={(e) => updateBalanceReq(idx, 'value', e.target.value)}
            />
            <div className="h-[18px]" />
          </div>
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => removeBalanceReq(idx)}
              disabled={balanceRequests.length <= 1 && !balanceRequests[0].plate && !balanceRequests[0].value}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="h-[18px]" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={addBalanceReq}>
        <Plus className="w-3 h-3" /> Adicionar solicitação
      </Button>
    </div>
  ) : null;

  // --- Ordered blocks ---
  const orderedBlocks = blockOrder === 'transfer-first'
    ? [transferBlock, balanceBlock]
    : [balanceBlock, transferBlock];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border sm:max-w-lg w-[calc(100%-2rem)] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {step === 1 ? 'Solicitar Transferência' : 'Confirmar Solicitação'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-5">
            {/* Type checkboxes */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Tipo de solicitação:</p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="want-transfer"
                  checked={wantTransfer}
                  onCheckedChange={(v) => setWantTransfer(!!v)}
                />
                <Label htmlFor="want-transfer" className="flex items-center gap-2 text-sm cursor-pointer">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  Transferência entre veículos
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="want-balance"
                  checked={wantBalance}
                  onCheckedChange={(v) => setWantBalance(!!v)}
                />
                <Label htmlFor="want-balance" className="flex items-center gap-2 text-sm cursor-pointer">
                  <CircleDollarSign className="w-4 h-4 text-primary" />
                  Solicitação de novo saldo
                </Label>
              </div>
            </div>

            {/* Ordered blocks */}
            {orderedBlocks}

            {/* Next */}
            <Button
              className="w-full gap-2"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
            >
              Próximo <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* User name */}
            <div>
              <Label className="text-sm text-muted-foreground">Seu nome</Label>
              <Input
                placeholder="Digite seu nome"
                value={userName}
                onChange={(e) => setUserName(e.target.value.slice(0, 100))}
                className="bg-background"
              />
            </div>

            {/* Preview */}
            <div>
              <Label className="text-sm text-muted-foreground">Prévia da mensagem</Label>
              <div className="mt-1 p-3 rounded-lg bg-muted/40 border border-border max-h-52 overflow-y-auto">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {formattedMessage}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleCopy}>
                <Copy className="w-4 h-4" /> Copiar
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!userName.trim()}
                onClick={handleSend}
              >
                <Send className="w-4 h-4" /> Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
