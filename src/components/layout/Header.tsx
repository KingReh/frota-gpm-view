import { Car, Grid, LayoutList, MonitorPlay, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeaderProps {
    viewMode: "table" | "card" | "carousel";
    setViewMode: (mode: "table" | "card" | "carousel") => void;
    isSynced?: boolean;
    lastUpdated?: Date | null;
    recentlyUpdated?: boolean;
}

export const Header = ({ viewMode, setViewMode, isSynced = true, lastUpdated, recentlyUpdated }: HeaderProps) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 z-50 px-2 md:px-6 lg:px-8 flex items-center justify-between glass-panel border-b border-white/10">
            {/* Brand Identity */}
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
                    <Car className="w-6 h-6 text-white" />
                    {recentlyUpdated && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                    )}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold tracking-tight leading-none text-white">
                        COMPESA
                        <span className="text-primary ml-1">GPM</span>
                    </h1>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                        Telemetria da Frota
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Sync Status - Adaptive Layout */}
                <div className="flex flex-col items-end mr-1 md:mr-4">
                    {/* Desktop: Full Status */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw
                            className={cn(
                                "w-3 h-3",
                                isSynced ? "text-emerald-500" : "animate-spin text-amber-500"
                            )}
                        />
                        <span className={cn(
                            "font-mono uppercase tracking-wider text-[10px]",
                            isSynced ? "text-emerald-500/80" : "text-amber-500/80"
                        )}>
                            {isSynced ? 'VOCÊ ESTÁ ONLINE' : 'SINCRONIZANDO...'}
                        </span>
                    </div>

                    {/* Mobile: Compact Status Indicator */}
                    <div className="md:hidden flex items-center gap-1 mb-0.5">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSynced ? "bg-emerald-500 shadow-[0_0_5px_theme(colors.emerald.500)]" : "bg-amber-500 animate-pulse"
                        )} />
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">
                            {isSynced ? 'VOCÊ ESTÁ ONLINE' : 'SINCRONIZANDO...'}
                        </span>
                    </div>

                    {lastUpdated && (
                        <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground/60">
                            <Clock className="w-2 md:w-2.5 h-2 md:h-2.5" />
                            <span className="whitespace-nowrap">
                                {isToday(lastUpdated)
                                    ? `Atualizado às ${format(lastUpdated, 'HH:mm', { locale: ptBR })}`
                                    : `Atualizado ${format(lastUpdated, "EEE - dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                                }
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};



