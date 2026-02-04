import { LayoutGrid, Table2, Layers } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ViewMode } from '@/types/vehicle';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-center border-b bg-background px-4 py-2">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as ViewMode)}
        className="gap-1"
      >
        <ToggleGroupItem value="table" aria-label="Modo Tabela" className="gap-2 px-3">
          <Table2 className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Tabela</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="card" aria-label="Modo Card" className="gap-2 px-3">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Cards</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="carousel" aria-label="Modo Carrossel" className="gap-2 px-3">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Carrossel</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
