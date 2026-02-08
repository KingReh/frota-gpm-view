import { useMemo } from 'react';
import { Fuel, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { parseBalance, getBalanceStatus } from '@/lib/balance';
import type { VehicleWithDetails } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TelemetryBarProps {
    vehicles: VehicleWithDetails[];
}

export function TelemetryBar({ vehicles }: TelemetryBarProps) {
    const stats = useMemo(() => {
        let total = 0;
        let high = 0;
        let medium = 0;
        let low = 0;

        vehicles.forEach((vehicle) => {
            const value = parseBalance(vehicle.balance);
            total += value;

            const status = getBalanceStatus(vehicle.balance);
            if (status === 'high') high++;
            else if (status === 'medium') medium++;
            else low++;
        });

        return { total, high, medium, low, count: vehicles.length };
    }, [vehicles]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (stats.count === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
            {/* Total Fleet Balance */}
            <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Saldo Total</p>
                        <p className="text-xl font-mono font-bold text-white tracking-tight">{formatCurrency(stats.total)}</p>
                    </div>
                </div>
            </div>

            {/* Vehicle Count */}
            <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Veículos Ativos</p>
                        <p className="text-xl font-mono font-bold text-white tracking-tight">{stats.count}</p>
                    </div>
                </div>
            </div>

            {/* Health Status */}
            <div className="glass-panel p-4 rounded-xl col-span-2 relative overflow-hidden">
                <div className="flex items-center justify-between h-full">
                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status da Frota</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5" title="Saldo alto">
                                <TrendingUp className="w-3 h-3 text-[hsl(var(--balance-high))]" />
                                <span className="text-sm font-mono font-bold text-[hsl(var(--balance-high))]">{stats.high}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Saldo médio">
                                <Minus className="w-3 h-3 text-[hsl(var(--balance-medium))]" />
                                <span className="text-sm font-mono font-bold text-[hsl(var(--balance-medium))]">{stats.medium}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Saldo baixo">
                                <TrendingDown className="w-3 h-3 text-[hsl(var(--balance-low))]" />
                                <span className="text-sm font-mono font-bold text-[hsl(var(--balance-low))]">{stats.low}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Chart Visualization */}
                    <div className="flex gap-1 items-end h-8 w-32">
                        <div style={{ height: `${(stats.high / stats.count) * 100}%` }} className="flex-1 bg-[hsl(var(--balance-high))] rounded-t-sm opacity-80" />
                        <div style={{ height: `${(stats.medium / stats.count) * 100}%` }} className="flex-1 bg-[hsl(var(--balance-medium))] rounded-t-sm opacity-80" />
                        <div style={{ height: `${(stats.low / stats.count) * 100}%` }} className="flex-1 bg-[hsl(var(--balance-low))] rounded-t-sm opacity-80" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
