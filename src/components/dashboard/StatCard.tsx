import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentColor?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, accentColor, delay = 0 }: StatCardProps) {
  return (
    <div
      className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      {/* Accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: accentColor || 'hsl(var(--primary))' }}
      />

      {/* Background icon */}
      <Icon className="absolute right-3 bottom-3 w-12 h-12 text-white/[0.04]" strokeWidth={1.5} />

      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-mono font-bold text-foreground leading-none">
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </p>
    </div>
  );
}
