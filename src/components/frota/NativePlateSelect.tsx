import { cn } from '@/lib/utils';

interface NativePlateSelectProps {
  value: string;
  onChange: (value: string) => void;
  plates: string[];
  placeholder?: string;
  className?: string;
}

export function NativePlateSelect({
  value,
  onChange,
  plates,
  placeholder = 'Placa',
  className,
}: NativePlateSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground',
        'appearance-none bg-no-repeat bg-[length:16px] bg-[right_8px_center]',
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        !value && 'text-muted-foreground',
        className,
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {plates.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
