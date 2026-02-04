import { cn } from '@/lib/utils';
import { getBalanceStatus, formatBalance } from '@/lib/balance';

interface BalanceIndicatorProps {
  balance: string | null;
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BalanceIndicator({ 
  balance, 
  className,
  showValue = true,
  size = 'md',
}: BalanceIndicatorProps) {
  const status = getBalanceStatus(balance);
  const formattedValue = formatBalance(balance);

  const statusColors = {
    high: 'bg-[hsl(var(--balance-high))] text-white',
    medium: 'bg-[hsl(var(--balance-medium))] text-black',
    low: 'bg-[hsl(var(--balance-low))] text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        statusColors[status],
        sizeClasses[size],
        className
      )}
    >
      {showValue ? formattedValue : null}
    </span>
  );
}
