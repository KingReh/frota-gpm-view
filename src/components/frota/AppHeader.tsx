import { RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppHeaderProps {
  isSynced: boolean;
  lastUpdated?: Date | null;
}

function formatLastUpdated(date: Date | null | undefined): { relative: string; full: string } | null {
  if (!date) return null;
  
  return {
    relative: formatDistanceToNow(date, { addSuffix: true, locale: ptBR }),
    full: format(date, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }),
  };
}

export function AppHeader({ isSynced, lastUpdated }: AppHeaderProps) {
  const formattedDate = formatLastUpdated(lastUpdated);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">GPM</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">Frota GPM</h1>
            <p className="text-xs text-muted-foreground">COMPESA</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-0.5">
          {/* Sync status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw 
              className={cn(
                "h-3 w-3",
                isSynced ? "text-[hsl(var(--sync-active))]" : "animate-spin text-[hsl(var(--sync-pending))]"
              )} 
            />
            <span className="hidden sm:inline">
              {isSynced ? 'Sincronizado' : 'Atualizando...'}
            </span>
          </div>
          
          {/* Last updated info */}
          {formattedDate && (
            <div 
              className="flex items-center gap-1 text-[10px] text-muted-foreground/70"
              title={`Última atualização: ${formattedDate.full}`}
            >
              <Clock className="h-2.5 w-2.5" />
              <span className="hidden xs:inline sm:hidden">{formattedDate.relative}</span>
              <span className="hidden sm:inline">Saldo atualizado {formattedDate.relative}</span>
              <span className="xs:hidden">{formattedDate.relative}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
