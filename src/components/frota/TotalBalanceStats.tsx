import { useMemo } from 'react';
import { TrendingUp, Wallet, Car, Info } from 'lucide-react';
import { parseBalance } from '@/lib/balance';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VehicleWithDetails } from '@/types/vehicle';

interface TotalBalanceStatsProps {
    vehicles: VehicleWithDetails[];
    totalFleetBalance: number;
}

export function TotalBalanceStats({ vehicles, totalFleetBalance }: TotalBalanceStatsProps) {
    const stats = useMemo(() => {
        const selectedTotal = vehicles.reduce((acc, vehicle) => {
            return acc + parseBalance(vehicle.balance);
        }, 0);

        const byCoordination = vehicles.reduce((acc, vehicle) => {
            if (!vehicle.coordination) return acc;
            const balance = parseBalance(vehicle.balance);
            const name = vehicle.coordination.name;
            const color = vehicle.coordination.color;
            if (!acc[name]) acc[name] = { total: 0, count: 0, color };
            acc[name].total += balance;
            acc[name].count += 1;
            return acc;
        }, {} as Record<string, { total: number; count: number; color: string }>);

        return { selectedTotal, byCoordination };
    }, [vehicles]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (vehicles.length === 0 && totalFleetBalance === 0) return null;

    return (
        <div className="space-y-8 p-4 md:p-6 lg:p-8 mesh-bg rounded-2xl overflow-hidden border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {/* Main Dashboard Card */}
                <div className="md:col-span-2 lg:col-span-2 glass-panel p-8 rounded-2xl relative overflow-hidden group border-l-4 border-l-primary shadow-lg">
                    <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                        <Wallet className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold font-mono">
                                    Somatório da Frota GPM
                                </p>
                            </div>
                            <h3 className="text-4xl lg:text-5xl font-mono font-bold text-white tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {formatCurrency(totalFleetBalance)}
                            </h3>
                            <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">
                                Esse somatório inclui os veículos indefinidos, reservas e toda a frota das coordenações.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Saldo das coordenações selecionadas</p>
                                <span className="text-sm font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                    {formatCurrency(stats.selectedTotal)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-fit">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400 font-mono">{vehicles.length}</span>
                                <span className="text-[9px] text-emerald-400/80 uppercase tracking-widest font-bold">Veículos Selecionados</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-20 invisible md:visible">
                        <div className="w-16 h-1 border-t border-r border-white/40 rounded-tr-lg" />
                    </div>
                </div>

                {/* Coordination Breakdown */}
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-1.5 h-6 bg-primary rounded-full shrink-0" />
                            <h4 className="text-[10px] md:text-xs uppercase tracking-widest md:tracking-[0.3em] font-bold text-white/70 leading-tight break-words">Breakdown por Coordenação</h4>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/5 whitespace-nowrap shrink-0 ml-2">
                            {Object.keys(stats.byCoordination).length} Coordenações
                        </span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto py-6 px-4 -mx-4 custom-scrollbar-thin">
                        {Object.entries(stats.byCoordination).map(([name, data]) => (
                            <div
                                key={name}
                                className="min-w-[240px] glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between group/card relative"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: data.color }}
                                        />
                                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider truncate max-w-[120px]" title={name}>
                                            {name}
                                        </span>
                                    </div>
                                    <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-3 h-3 text-white/20 group-hover/card:text-white/60 transition-colors cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[220px] text-xs">
                                                Saldo total e quantidade de veículos da coordenação {name}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="space-y-1">
                                    <p className={cn(
                                        "text-xl font-mono font-bold tracking-tighter",
                                        data.total > 0 ? "text-white" : "text-red-400"
                                    )}>
                                        {formatCurrency(data.total)}
                                    </p>
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                                            {data.count} Veículos
                                        </p>
                                        <div className="h-0.5 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${Math.min((data.total / Math.max(stats.selectedTotal, 1)) * 100, 100)}%`,
                                                    backgroundColor: data.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
