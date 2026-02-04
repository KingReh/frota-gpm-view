import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Coordination } from '@/types/vehicle';

interface CoordinationFiltersProps {
  coordinations: Coordination[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function CoordinationFilters({
  coordinations,
  selectedIds,
  onToggle,
  onClear,
}: CoordinationFiltersProps) {
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="border-b bg-background">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2 px-4 py-3">
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 shrink-0 gap-1 px-2 text-xs"
            >
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
          
          {coordinations.map((coord) => {
            const isSelected = selectedIds.includes(coord.id);
            return (
              <Badge
                key={coord.id}
                variant="outline"
                onClick={() => onToggle(coord.id)}
                className="shrink-0 cursor-pointer select-none px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: isSelected ? coord.color : 'transparent',
                  color: isSelected ? coord.font_color : 'inherit',
                  borderColor: coord.color,
                }}
              >
                {coord.name}
              </Badge>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
