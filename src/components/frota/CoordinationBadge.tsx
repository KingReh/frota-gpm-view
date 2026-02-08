import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Coordination } from '@/types/vehicle';

interface CoordinationBadgeProps {
    coordination: Coordination;
    className?: string;
    compact?: boolean;
}

export function CoordinationBadge({ coordination, className, compact = false }: CoordinationBadgeProps) {
    return (
        <Badge
            className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all duration-300 hover:brightness-110 hover:scale-105",
                compact && "text-[9px] px-2 py-1 tracking-wider",
                className
            )}
            style={{
                background: `linear-gradient(90deg, ${coordination.color}15, ${coordination.color}05)`,
                color: coordination.color,
                border: `1px solid ${coordination.color}40`,
                boxShadow: `0 0 12px ${coordination.color}10, inset 0 0 0 1px ${coordination.color}10`,
                textShadow: `0 0 8px ${coordination.color}40`
            }}
        >
            {compact ? coordination.name.substring(0, 12) : coordination.name}
        </Badge>
    );
}
