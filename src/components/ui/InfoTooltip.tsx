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

  const contentClass = "max-w-[220px] px-3 py-2.5 rounded-xl bg-popover border border-border text-popover-foreground text-[11px] leading-relaxed shadow-xl z-[200] w-auto";

  // Always render both, show the right one via CSS media query approach
  // Mobile: Popover (click/tap), Desktop: Tooltip (hover)
  return (
    <>
      {/* Mobile: Popover */}
      <span className={cn("md:hidden inline-flex", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center min-w-[32px] min-h-[32px] p-1.5 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors duration-200 cursor-help touch-manipulation"
              aria-label={text}
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" sideOffset={6} className={contentClass}>
            {text}
          </PopoverContent>
        </Popover>
      </span>

      {/* Desktop: Tooltip */}
      <span className={cn("hidden md:inline-flex", className)}>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex p-0.5 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors duration-200 cursor-help"
                aria-label={text}
                tabIndex={0}
              >
                <Info className="w-3 h-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" sideOffset={6} className={contentClass}>
              {text}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    </>
  );
}
