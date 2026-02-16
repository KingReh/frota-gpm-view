import { useState, useMemo, useCallback } from 'react';
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
import {
  formatPhoneForWhatsApp,
  openWhatsApp,
  openEmail,
  getGreeting,
  formatValueBR,
} from '@/lib/whatsapp';
import { parseBalance } from '@/lib/balance';
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
  const [userName, setUserName] = useState('');
  const { toast } = useToast();
  const { data: gestor } = useGestorFrota();

  const plates = useMemo(
    () => vehicles.map((v) => v.plate).sort(),
    [vehicles]
  );

  const coordName = useMemo(() => {
    if (selectedCoordinations.length === 0) return 'GPM';
    const coord = coordinations.find((c) => c.id === selectedCoordinations[0]);
    return coord?.name || 'GPM';
  }, [coordinations, selectedCoordinations]);

  const resetForm = useCallback(() => {
    setStep(1);
    setWantTransfer(false);
    setWantBalance(false);
    setTransfers([emptyTransfer()]);
    setBalanceRequests([emptyBalanceRequest()]);
    setUserName('');
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

  // --- Build message ---
  const formattedMessage = useMemo(() => {
    if (!gestor) return '';
    const greeting = getGreeting();
    const lines: string[] = [];
    lines.push(`${greeting}, ${gestor.name}!`);
    lines.push('');
    lines.push(
      `Me chamo ${userName.trim() || '___'} da coordenação ${coordName} e gostaria de solicitar uma transferência de combustível para minha frota da seguinte forma:`
    );

    if (wantTransfer) {
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
    }

    if (wantBalance) {
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
    }

    return lines.join('\n');
  }, [gestor, userName, coordName, wantTransfer, wantBalance, transfers, balanceRequests]);

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
    if (!gestor) {
      toast({
        title: 'Gestor indisponível',
        description:
          'No momento o gestor da frota não permite solicitação por este canal. Solicite da maneira tradicional.',
        variant: 'destructive',
      });
      return;
    }

    // Copy as fallback
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
    setTransfers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const addTransfer = () => setTransfers((prev) => [...prev, emptyTransfer()]);
  const removeTransfer = (idx: number) =>
    setTransfers((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  // --- Balance request list helpers ---
  const updateBalanceReq = (idx: number, field: keyof BalanceRequestItem, value: string) => {
    setBalanceRequests((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const addBalanceReq = () => setBalanceRequests((prev) => [...prev, emptyBalanceRequest()]);
  const removeBalanceReq = (idx: number) =>
    setBalanceRequests((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
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

            {/* Transfers */}
            {wantTransfer && (
              <div className="space-y-3 p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Transferências
                </p>
                {transfers.map((t, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                    <div className="flex-1 min-w-0">
                      <Label className="text-[10px] text-muted-foreground">Origem</Label>
                      <Select value={t.fromPlate} onValueChange={(v) => updateTransfer(idx, 'fromPlate', v)}>
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue placeholder="Placa" />
                        </SelectTrigger>
                        <SelectContent>
                          {plates.map((p) => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-[10px] text-muted-foreground">Valor</Label>
                      <Input
                        className="h-9 text-xs bg-background"
                        placeholder="0,00"
                        value={t.value}
                        onChange={(e) => updateTransfer(idx, 'value', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-[10px] text-muted-foreground">Destino</Label>
                      <Select value={t.toPlate} onValueChange={(v) => updateTransfer(idx, 'toPlate', v)}>
                        <SelectTrigger className={cn("h-9 text-xs bg-background", t.fromPlate && t.toPlate && t.fromPlate === t.toPlate && "border-destructive")}>
                          <SelectValue placeholder="Placa" />
                        </SelectTrigger>
                        <SelectContent>
                          {plates.filter((p) => p !== t.fromPlate).map((p) => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTransfer(idx)}
                      disabled={transfers.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={addTransfer}>
                  <Plus className="w-3 h-3" /> Adicionar transferência
                </Button>
              </div>
            )}

            {/* Balance requests */}
            {wantBalance && (
              <div className="space-y-3 p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Solicitações de Saldo
                </p>
                {balanceRequests.map((b, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                    <div className="flex-1 min-w-0">
                      <Label className="text-[10px] text-muted-foreground">Veículo</Label>
                      <Select value={b.plate} onValueChange={(v) => updateBalanceReq(idx, 'plate', v)}>
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue placeholder="Placa" />
                        </SelectTrigger>
                        <SelectContent>
                          {plates.map((p) => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-[10px] text-muted-foreground">Valor</Label>
                      <Input
                        className="h-9 text-xs bg-background"
                        placeholder="0,00"
                        value={b.value}
                        onChange={(e) => updateBalanceReq(idx, 'value', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBalanceReq(idx)}
                      disabled={balanceRequests.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={addBalanceReq}>
                  <Plus className="w-3 h-3" /> Adicionar solicitação
                </Button>
              </div>
            )}

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
            <div className="flex gap-2">
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
