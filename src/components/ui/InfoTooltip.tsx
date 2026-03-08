import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const isMobile = useIsMobile();

  const triggerClass = cn(
    "inline-flex p-0.5 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors duration-200 cursor-help",
    className
  );

  const contentClass = "max-w-[220px] px-3 py-2.5 rounded-xl bg-popover border border-border text-popover-foreground text-[11px] leading-relaxed shadow-xl z-[200] w-auto";

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClass} aria-label={text}>
            <Info className="w-3 h-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" sideOffset={6} className={contentClass}>
          {text}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={triggerClass} aria-label={text} tabIndex={0}>
            <Info className="w-3 h-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={6} className={contentClass}>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
