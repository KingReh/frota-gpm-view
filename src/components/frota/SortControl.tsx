import { useState } from "react";
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

interface SortControlProps {
    currentSort: SortOption;
    onSortChange: (option: SortOption) => void;
}

export function SortControl({ currentSort, onSortChange }: SortControlProps) {
    const [open, setOpen] = useState(false);

    const getSortLabel = (sort: SortOption) => {
        switch (sort) {
            case 'balance_desc': return 'Saldo (Maior)';
            case 'balance_asc': return 'Saldo (Menor)';
            case 'plate_asc': return 'Placa (A-Z)';
            case 'plate_desc': return 'Placa (Z-A)';
            case 'coordination_asc': return 'Coordenação (A-Z)';
            case 'coordination_desc': return 'Coordenação (Z-A)';
            default: return 'Saldo (Maior)';
        }
    };

    const getSortIcon = (sort: SortOption) => {
        if (sort.includes('balance')) return <DollarSign className="w-4 h-4 mr-2 text-primary" />;
        if (sort.includes('plate')) return <Car className="w-4 h-4 mr-2" />;
        if (sort.includes('coordination')) return <Building2 className="w-4 h-4 mr-2" />;
        return <DollarSign className="w-4 h-4 mr-2 text-primary" />;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 min-h-[44px] md:h-10 bg-card border-border text-foreground hover:text-primary hover:bg-muted/50 transition-all gap-2 min-w-[140px] justify-between select-none shadow-sm"
                >
                    <div className="flex items-center">
                        {getSortIcon(currentSort)}
                        <span className="text-xs font-medium">{getSortLabel(currentSort)}</span>
                    </div>
                    <ArrowDownUp className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] bg-popover/95 backdrop-blur-xl border-border text-popover-foreground shadow-2xl">
                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    onClick={() => onSortChange('balance_desc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'balance_desc' && "text-primary font-bold bg-primary/10")}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Saldo (Maior para menor)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('balance_asc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'balance_asc' && "text-primary font-bold bg-primary/10")}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Saldo (Menor para maior)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    onClick={() => onSortChange('plate_asc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'plate_asc' && "text-primary font-bold bg-primary/10")}
                >
                    <ArrowDownAZ className="w-4 h-4" />
                    <span>Placa (A-Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('plate_desc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'plate_desc' && "text-primary font-bold bg-primary/10")}
                >
                    <ArrowUpAZ className="w-4 h-4" />
                    <span>Placa (Z-A)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                    onClick={() => onSortChange('coordination_asc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'coordination_asc' && "text-primary font-bold bg-primary/10")}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Coordenação (A-Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSortChange('coordination_desc')}
                    className={cn("focus:bg-muted focus:text-foreground cursor-pointer gap-2", currentSort === 'coordination_desc' && "text-primary font-bold bg-primary/10")}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Coordenação (Z-A)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
