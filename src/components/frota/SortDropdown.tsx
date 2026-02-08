import { ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { SortOption } from '@/types/vehicle';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; group: string }[] = [
  { value: 'plate-asc', label: 'Placa A → Z', group: 'Placa' },
  { value: 'plate-desc', label: 'Placa Z → A', group: 'Placa' },
  { value: 'balance-asc', label: 'Menor saldo', group: 'Saldo' },
  { value: 'balance-desc', label: 'Maior saldo', group: 'Saldo' },
  { value: 'coordination-asc', label: 'Coordenação A → Z', group: 'Coordenação' },
  { value: 'coordination-desc', label: 'Coordenação Z → A', group: 'Coordenação' },
];

function getSortIcon(value: SortOption) {
  if (value.startsWith('balance')) {
    return value.endsWith('asc') ? ArrowDown01 : ArrowUp01;
  }
  return value.endsWith('asc') ? ArrowDownAZ : ArrowUpAZ;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const Icon = getSortIcon(value);
  const currentLabel = SORT_OPTIONS.find(o => o.value === value)?.label ?? 'Ordenar';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center justify-between text-sm"
          >
            {option.label}
            {value === option.value && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
