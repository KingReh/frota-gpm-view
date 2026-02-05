import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Coordination } from '@/types/vehicle';

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
      return 'Todas as coordenações';
    }
    if (selectedCount === 1) {
      const selected = coordinations.find(c => c.id === selectedIds[0]);
      return selected?.name || '1 coordenação';
    }
    if (allSelected) {
      return 'Todas selecionadas';
    }
    return `${selectedCount} coordenações`;
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onClear();
    } else {
      onSelectAll?.(coordinations.map(c => c.id));
    }
  };

  return (
    <div className="border-b bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 px-3 text-sm font-medium"
            >
              {getButtonLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="z-50 w-56 bg-popover"
          >
            <DropdownMenuCheckboxItem
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className="cursor-pointer font-medium"
            >
              Selecionar todas
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {coordinations.map((coord) => {
              const isSelected = selectedIds.includes(coord.id);
              return (
                <DropdownMenuCheckboxItem
                  key={coord.id}
                  checked={isSelected}
                  onCheckedChange={() => onToggle(coord.id)}
                  className="cursor-pointer gap-2"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: coord.color }}
                  />
                  <span className="truncate">{coord.name}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-9 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
