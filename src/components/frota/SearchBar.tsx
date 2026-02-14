import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por placa ou modelo..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 h-9 text-sm bg-surface-overlay border-border/40 rounded-lg placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 focus-visible:border-primary/40"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onChange('')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
