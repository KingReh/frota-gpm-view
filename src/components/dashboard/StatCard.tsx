import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor?: string;
  delay?: number;
  tooltip?: string;
}

export function StatCard({ label, value, icon: Icon, accentColor, delay = 0, tooltip }: StatCardProps) {
  return (
    <div
      className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      {/* Accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accentColor || 'hsl(var(--primary))' }}
      />

      {/* Background icon */}
      <Icon className="absolute right-3 bottom-3 w-12 h-12 text-white/[0.04]" strokeWidth={1.5} />

      <div className="flex items-center gap-1.5 mb-2">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
          {label}
        </p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <p className="text-2xl md:text-3xl font-mono font-bold text-foreground leading-none">
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </p>
    </div>
  );
}
