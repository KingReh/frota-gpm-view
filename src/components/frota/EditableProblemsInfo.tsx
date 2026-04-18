import { useState, useEffect } from 'react';
import { Info, Pencil, Check, X, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EditableProblemsInfoProps {
  text: string;
  onSave: (newText: string) => Promise<void>;
}

export function EditableProblemsInfo({ text, onSave }: EditableProblemsInfoProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraft(text);
    }
  }, [open, text]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      toast({ title: 'Descrição não pode ficar vazia', variant: 'destructive' });
      return;
    }
    if (trimmed === text) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      toast({ title: 'Problemas atualizados!' });
      setEditing(false);
      setOpen(false);
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] p-1 rounded-full text-muted-foreground/70 hover:text-primary hover:bg-primary/10 transition-colors duration-200 touch-manipulation"
          aria-label="Ver/editar problemas identificados"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-[260px] p-3 rounded-xl bg-popover border border-border shadow-xl z-[200]"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Editar problemas
            </p>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[80px] text-xs bg-background resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => {
                  setEditing(false);
                  setDraft(text);
                }}
                disabled={saving}
              >
                <X className="w-3 h-3" />
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Problemas identificados
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                aria-label="Editar"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-popover-foreground whitespace-pre-wrap">
              {text}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
