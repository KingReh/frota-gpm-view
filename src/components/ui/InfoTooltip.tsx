import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  return (
    <span className={cn("relative inline-flex group/info", className)}>
      <span
        className="p-0.5 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors duration-200 cursor-help"
        aria-label={text}
        tabIndex={0}
      >
        <Info className="w-3 h-3" />
      </span>

      <span className="pointer-events-none absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2.5 rounded-xl bg-popover border border-border text-popover-foreground text-[11px] leading-relaxed shadow-xl opacity-0 scale-95 transition-all duration-150 group-hover/info:opacity-100 group-hover/info:scale-100 group-focus-within/info:opacity-100 group-focus-within/info:scale-100 group-active/info:opacity-100 group-active/info:scale-100">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
      </span>
    </span>
  );
}
