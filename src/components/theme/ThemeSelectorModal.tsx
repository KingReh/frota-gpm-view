import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { type ThemeId, type ThemeConfig } from '@/types/theme';
import { Palette, Check, Sparkles, Sun, Moon, RotateCcw, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ThemeSelectorModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ThemeSelectorModal({ open, onOpenChange }: ThemeSelectorModalProps) {
  const {
    theme: currentTheme,
    setTheme,
    resetToDefaultTheme,
    availableThemes,
    isThemeModalOpen,
    setIsThemeModalOpen,
  } = useTheme();

  const [activeFilter, setActiveFilter] = useState<'all' | 'dark' | 'light'>('all');

  const isOpen = open !== undefined ? open : isThemeModalOpen;
  const handleOpenChange = onOpenChange || setIsThemeModalOpen;

  const filteredThemes = availableThemes.filter((t) => {
    if (activeFilter === 'dark') return t.type === 'dark';
    if (activeFilter === 'light') return t.type === 'light';
    return true;
  });

  const handleSelectTheme = (themeId: ThemeId, themeName: string) => {
    if (themeId === currentTheme) return;
    setTheme(themeId);
    toast.success(`Tema alterado para "${themeName}"`, {
      description: 'As alterações foram aplicadas imediatamente e salvas no navegador.',
      duration: 2500,
    });
  };

  const handleReset = () => {
    resetToDefaultTheme();
    toast.info('Tema restaurado para COMPESA Padrão', {
      duration: 2500,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  Temas do Sistema
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                    {availableThemes.length} opções
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Personalize as cores de toda a interface. As preferências ficam salvas no seu navegador.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 pt-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                activeFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Todos ({availableThemes.length})
            </button>
            <button
              onClick={() => setActiveFilter('dark')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
                activeFilter === 'dark'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Moon className="w-3 h-3" />
              Escuros ({availableThemes.filter((t) => t.type === 'dark').length})
            </button>
            <button
              onClick={() => setActiveFilter('light')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors',
                activeFilter === 'light'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Sun className="w-3 h-3" />
              Claros ({availableThemes.filter((t) => t.type === 'light').length})
            </button>
          </div>
        </DialogHeader>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredThemes.map((themeItem) => {
              const isSelected = themeItem.id === currentTheme;
              const { primary, secondary, background, card, text, border } = themeItem.previewColors;

              return (
                <div
                  key={themeItem.id}
                  onClick={() => handleSelectTheme(themeItem.id, themeItem.name)}
                  className={cn(
                    'group relative rounded-xl border p-4 text-left cursor-pointer transition-all duration-200',
                    'hover:shadow-md hover:border-primary/50',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.04] shadow-lg shadow-primary/5'
                      : 'border-border/70 bg-card hover:bg-muted/30'
                  )}
                >
                  {/* Active Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm animate-in zoom-in-90 duration-200">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      ATIVO
                    </div>
                  )}

                  {/* Header info */}
                  <div className="pr-14 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {themeItem.name}
                        {themeItem.isDefault && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                            Padrão
                          </span>
                        )}
                      </h4>
                    </div>
                    <p className="text-[11px] font-medium text-primary/90 mt-0.5">
                      {themeItem.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3.5">
                    {themeItem.description}
                  </p>

                  {/* Mini Preview Box */}
                  <div
                    className="rounded-lg p-2.5 mb-3 border transition-transform duration-200 group-hover:scale-[1.01]"
                    style={{
                      backgroundColor: background,
                      borderColor: border,
                      color: text,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: primary }}
                        />
                        <span className="text-[10px] font-bold tracking-tight font-mono">
                          COMPESA GPM
                        </span>
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                        style={{
                          backgroundColor: primary,
                          color: themeItem.type === 'light' ? '#FFFFFF' : '#FFFFFF',
                        }}
                      >
                        ONLINE
                      </span>
                    </div>

                    <div
                      className="rounded p-2 flex items-center justify-between text-[11px] font-mono border"
                      style={{
                        backgroundColor: card,
                        borderColor: border,
                      }}
                    >
                      <span className="text-[10px] opacity-70">Saldo Frota</span>
                      <span className="font-bold text-xs" style={{ color: secondary }}>
                        R$ 1.480,00
                      </span>
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground/80 tracking-wider">
                      Paleta
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: primary }}
                        title="Cor Primária"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: secondary }}
                        title="Cor Secundária"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: background }}
                        title="Plano de Fundo"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: card }}
                        title="Superfície / Cards"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full sm:w-auto text-xs h-9 rounded-xl border-border hover:bg-muted flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            Restaurar Padrão COMPESA
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto text-xs h-9 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            Concluído
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
