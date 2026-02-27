import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp, DollarSign, Building2, Car } from "lucide-react";
import type { SortOption } from "@/types/vehicle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SortControlProps {
    currentSort: SortOption;
    onSortChange: (option: SortOption) => void;
}

export function SortControl({ currentSort, onSortChange }: SortControlProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTouchStart = useCallback(() => {
        if (!isMobile) return;
        longPressTimer.current = setTimeout(() => {
            setOpen(true);
            // Vibrate for haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(30);
        }, 500);
    }, [isMobile]);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleTouchMove = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);
    const getSortLabel = (sort: SortOption) => {
        switch (sort) {
            case 'plate_asc': return 'Placa (A-Z)';
            case 'plate_desc': return 'Placa (Z-A)';
            case 'balance_desc': return 'Saldo (Maior)';
            case 'balance_asc': return 'Saldo (Menor)';
            case 'coordination_asc': return 'Coordenação (A-Z)';
            case 'coordination_desc': return 'Coordenação (Z-A)';
            default: return 'Ordenar';
        }
    };

    const getSortIcon = (sort: SortOption) => {
        if (sort.includes('plate')) return <Car className="w-4 h-4 mr-2" />;
        if (sort.includes('balance')) return <DollarSign className="w-4 h-4 mr-2" />;
        if (sort.includes('coordination')) return <Building2 className="w-4 h-4 mr-2" />;
        return <ArrowDownUp className="w-4 h-4 mr-2" />;
    };

    return (
        <DropdownMenu open={open} onOpenChange={(v) => {
            // On mobile, only allow programmatic open (via long-press)
            if (isMobile && v) return;
            setOpen(v);
        }}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 md:h-10 bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all gap-2 min-w-[140px] justify-between select-none"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    onClick={(e) => {
                        if (isMobile) e.preventDefault();
                    }}
                >
                    <div className="flex items-center">
                        {getSortIcon(currentSort)}
                        <span className="text-xs font-medium">{getSortLabel(currentSort)}</span>
                    </div>
                    <ArrowDownUp className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-black/90 backdrop-blur-xl border-white/10 text-zinc-300">
                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    onClick={() => onSortChange('plate_asc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'plate_asc' && "text-primary font-bold")}
                >
                    <ArrowDownAZ className="w-4 h-4" />
                    <span>Placa (A-Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('plate_desc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'plate_desc' && "text-primary font-bold")}
                >
                    <ArrowUpAZ className="w-4 h-4" />
                    <span>Placa (Z-A)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    onClick={() => onSortChange('balance_desc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'balance_desc' && "text-primary font-bold")}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Saldo (Maior)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('balance_asc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'balance_asc' && "text-primary font-bold")}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Saldo (Menor)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    onClick={() => onSortChange('coordination_asc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'coordination_asc' && "text-primary font-bold")}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Coordenação (A-Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('coordination_desc')}
                    className={cn("focus:bg-white/10 focus:text-white cursor-pointer gap-2", currentSort === 'coordination_desc' && "text-primary font-bold")}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Coordenação (Z-A)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
