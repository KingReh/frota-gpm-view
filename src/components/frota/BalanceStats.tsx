import { useMemo } from 'react';
import { Fuel, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { parseBalance, getBalanceStatus, type BalanceStatus } from '@/lib/balance';
import type { VehicleWithDetails } from '@/types/vehicle';

interface BalanceStatsProps {
  vehicles: VehicleWithDetails[];
}

export function BalanceStats({ vehicles }: BalanceStatsProps) {
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
    }).format(value);
  };

  if (stats.count === 0) {
    return null;
  }

  return (
    <div className="border-b bg-background">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        {/* Total Balance */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Fuel className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Total</p>
            <p className="text-sm font-semibold">{formatCurrency(stats.total)}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Vehicle Count */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Veículos</p>
          <p className="text-sm font-semibold">{stats.count}</p>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Status Breakdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Saldo alto (> R$200)">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--balance-high))]" />
            <span className="text-sm font-medium text-[hsl(var(--balance-high))]">{stats.high}</span>
          </div>
          <div className="flex items-center gap-1" title="Saldo médio (R$100-R$200)">
            <Minus className="h-4 w-4 text-[hsl(var(--balance-medium))]" />
            <span className="text-sm font-medium text-[hsl(var(--balance-medium))]">{stats.medium}</span>
          </div>
          <div className="flex items-center gap-1" title="Saldo baixo (< R$100)">
            <TrendingDown className="h-4 w-4 text-[hsl(var(--balance-low))]" />
            <span className="text-sm font-medium text-[hsl(var(--balance-low))]">{stats.low}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
