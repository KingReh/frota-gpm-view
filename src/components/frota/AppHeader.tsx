import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  isSynced: boolean;
  lastUpdated?: Date;
}

export function AppHeader({ isSynced, lastUpdated }: AppHeaderProps) {
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
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
      </div>
    </header>
  );
}
