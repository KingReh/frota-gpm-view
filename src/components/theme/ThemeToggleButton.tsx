import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggleButton({ className, showLabel = false }: ThemeToggleButtonProps) {
  const { openThemeSelector, themeConfig } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={openThemeSelector}
          className={cn(
            'flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl',
            'bg-muted/40 border border-border/70 hover:bg-primary/15 hover:border-primary/30',
            'text-foreground/80 hover:text-primary transition-all duration-200 group',
            'active:scale-95 shadow-sm',
            className
          )}
          aria-label={`Trocar Tema (Atual: ${themeConfig.name})`}
        >
          <div className="relative flex items-center justify-center">
            <Palette className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card shadow-xs"
              style={{ backgroundColor: themeConfig.previewColors.primary }}
            />
          </div>
          {showLabel && (
            <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors hidden sm:inline">
              Tema
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs font-mono font-medium">
        Tema: <span className="font-bold text-primary">{themeConfig.name}</span>
      </TooltipContent>
    </Tooltip>
  );
}
