import { ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Coordination } from '@/types/vehicle';
import { cn } from '@/lib/utils'; // Ensure cn is imported if needed, though mostly standard classes here
import { motion } from 'framer-motion';

interface CoordinationFiltersProps {
  coordinations: Coordination[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onSelectAll?: (ids: string[]) => void;
}

export function CoordinationFilters({
  coordinations,
  selectedIds,
  onToggle,
  onClear,
  onSelectAll,
}: CoordinationFiltersProps) {
  const hasSelection = selectedIds.length > 0;
  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === coordinations.length && coordinations.length > 0;

  const getButtonLabel = () => {
    if (selectedCount === 0) {
      return 'Filtrar por Coordenação';
    }
    if (selectedCount === 1) {
      const selected = coordinations.find(c => c.id === selectedIds[0]);
      return selected?.name || '1 Selecionada';
    }
    if (allSelected) {
      return 'Todas Selecionadas';
    }
    return `${selectedCount} Selecionadas`;
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onClear();
    } else {
      onSelectAll?.(coordinations.map(c => c.id));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 gap-2 px-4 text-sm font-medium transition-all duration-300 border-white/10 hover:bg-white/5",
              hasSelection
                ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                : "bg-black/40 text-muted-foreground backdrop-blur-md"
            )}
          >
            <Filter className={cn("w-4 h-4", hasSelection && "text-primary")} />
            {getButtonLabel()}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-50 w-64 bg-black/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-4 rounded-2xl"
        >
          <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Coordenações
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuCheckboxItem
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            className="cursor-pointer font-medium focus:bg-white/10 focus:text-white rounded-lg my-2"
          >
            Selecionar todas
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {coordinations.map((coord) => {
              const isSelected = selectedIds.includes(coord.id);
              return (
                <DropdownMenuCheckboxItem
                  key={coord.id}
                  checked={isSelected}
                  onCheckedChange={() => onToggle(coord.id)}
                  className="cursor-pointer gap-2 focus:bg-white/10 focus:text-white rounded-lg my-2"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]",
                      isSelected ? "opacity-100" : "opacity-50"
                    )}
                    style={{ backgroundColor: coord.color, color: coord.color }}
                  />
                  <span className="truncate">{coord.name}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasSelection && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-10 gap-1 px-3 text-xs text-muted-foreground hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </Button>
        </motion.div>
      )}
    </div>
  );
}
