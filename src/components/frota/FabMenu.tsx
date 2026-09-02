import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, MapPin, Key, Wrench, ArrowLeftRight, Map, Settings, Tractor, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransferRequestModal } from "./TransferRequestModal";
import { MaintenanceModal } from "./MaintenanceModal";
import { useGestorFrota } from "@/hooks/useGestorFrota";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import type { VehicleWithDetails, Coordination } from "@/types/vehicle";

const links = [
  {
    label: "Instruções iButtons",
    href: "http://bi-frota.lovable.app/procedimento-ligar-veiculo",
    icon: Key,
    description: "Como ligar o veículo corretamente",
  },
  {
    label: "Postos Credenciados",
    href: "https://bi-frota.lovable.app/postos",
    icon: MapPin,
    description: "Rede de postos de combustíveis",
  },
  {
    label: "Ordens de Manutenção GAD",
    href: "https://app.powerbi.com/view?r=eyJrIjoiNDlmYTYzYTEtOGM3Mi00M2VjLWFkZTgtZWViM2I3NzBkZDhhIiwidCI6IjU3YTY2OThkLTA5M2QtNDIxOC05OTA0LWVkMDRmOWNiNDI1MiJ9",
    icon: Wrench,
    description: "Gerenciamento de OS da GAD veículos",
  },
  {
    label: "CRLV's",
    href: "https://bi-frota.lovable.app/regularizacao-documentos",
    icon: FileText,
    description: "Documentos de veículos",
  },
  {
    label: "AutoVision",
    href: "https://www.autovisionweb.ddns.com.br",
    icon: Map,
    description: "Sistema de monitoramento de veículos",
  },
];

interface FabMenuProps {
  vehicles?: VehicleWithDetails[];
  coordinations?: Coordination[];
  selectedCoordinations?: string[];
}

export function FabMenu({ vehicles = [], coordinations = [], selectedCoordinations = [] }: FabMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [transferModalOpen, setTransferModalOpen] = React.useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = React.useState(false);
  const [isOverFooter, setIsOverFooter] = React.useState(false);
  const fabRef = React.useRef<HTMLDivElement>(null);
  const { data: gestor } = useGestorFrota();
  const { toast } = useToast();
  const { openThemeSelector, themeConfig } = useTheme();

  const showMaquinarioSul = React.useMemo(() => {
    if (!selectedCoordinations.length) return false;
    const selectedNames = coordinations
      .filter(c => selectedCoordinations.includes(c.id))
      .map(c => c.name.trim().toUpperCase());
    if (!selectedNames.length) return false;
    const allowed = new Set(["CPR SUL", "CMA SUL"]);
    return selectedNames.every(n => allowed.has(n));
  }, [coordinations, selectedCoordinations]);

  React.useEffect(() => {
    const checkOverlap = () => {
      const footer = document.querySelector("footer");
      const fab = fabRef.current?.querySelector("button");
      if (!footer || !fab) return;

      const footerRect = footer.getBoundingClientRect();
      const fabRect = fab.getBoundingClientRect();

      setIsOverFooter(fabRect.bottom > footerRect.top && fabRect.top < footerRect.bottom);
    };

    window.addEventListener("scroll", checkOverlap, { passive: true });
    window.addEventListener("resize", checkOverlap, { passive: true });
    checkOverlap();

    return () => {
      window.removeEventListener("scroll", checkOverlap);
      window.removeEventListener("resize", checkOverlap);
    };
  }, []);

  const handleTransferClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setIsOpen(false);
    if (!gestor) {
      toast({
        title: 'Gestor indisponível',
        description:
          'No momento o gestor da frota não permite solicitação por este canal. Solicite da maneira tradicional.',
        variant: 'destructive',
      });
      return;
    }
    setTransferModalOpen(true);
  };

  return (
    <>
      <div ref={fabRef} className={cn("fixed bottom-16 md:bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 mb-safe transition-opacity duration-300", isOverFooter && !isOpen && "opacity-30")}>
        {/* FAB Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30",
            "bg-primary text-primary-foreground",
            "border border-border/50 transition-colors duration-300",
            isOpen && "bg-muted text-foreground shadow-black/20",
          )}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="flex flex-col gap-2 p-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/50 min-w-[220px]"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 pb-1">
                Acesso Rápido
              </span>

              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "bg-surface-interactive/50 hover:bg-primary/10 hover:border-primary/20",
                    "border border-transparent transition-all duration-200 group",
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground leading-tight truncate">{link.label}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{link.description}</span>
                  </div>
                </motion.a>
              ))}

              {/* GPM Manutenção button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsOpen(false);
                  setMaintenanceModalOpen(true);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                  "bg-surface-interactive/50 hover:bg-primary/10 hover:border-primary/20",
                  "border border-transparent transition-all duration-200 group",
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight truncate">
                    GPM Manutenção
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">Controle de manutenção da frota da gerência</span>
                </div>
              </motion.button>

              {/* Transfer Request button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (links.length + 1) * 0.05 }}
                onClick={handleTransferClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                  "bg-surface-interactive/50 hover:bg-primary/10 hover:border-primary/20",
                  "border border-transparent transition-all duration-200 group",
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight truncate">
                    Solicitar Transferência
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">Saldo entre veículos ou saldo novo</span>
                </div>
              </motion.button>

              {/* Personalizar Tema button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (links.length + 2) * 0.05 }}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsOpen(false);
                  openThemeSelector();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                  "bg-surface-interactive/50 hover:bg-primary/10 hover:border-primary/20",
                  "border border-transparent transition-all duration-200 group",
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground leading-tight truncate">
                      Personalizar Tema
                    </span>
                    <span
                      className="w-2 h-2 rounded-full border border-card shadow-xs"
                      style={{ backgroundColor: themeConfig.previewColors.primary }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Tema ativo: {themeConfig.name}
                  </span>
                </div>
              </motion.button>

              {/* Controle de Maquinário SUL (conditional) */}
              {showMaquinarioSul && (
                <motion.a
                  href="https://compesamaquinariosul.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (links.length + 3) * 0.05 }}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "bg-surface-interactive/50 hover:bg-primary/10 hover:border-primary/20",
                    "border border-transparent transition-all duration-200 group",
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Tractor className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground leading-tight truncate">
                      Controle de Maquinário SUL
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      Gestão de abastecimentos dos cartões de maquinário da SUL.
                    </span>
                  </div>
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TransferRequestModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        vehicles={vehicles}
        coordinations={coordinations}
        selectedCoordinations={selectedCoordinations}
      />

      <MaintenanceModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
        vehicles={vehicles}
        coordinations={coordinations}
        selectedCoordinations={selectedCoordinations}
      />
    </>
  );
}
