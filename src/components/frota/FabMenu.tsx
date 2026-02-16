import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText, MapPin, Key, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransferRequestModal } from "./TransferRequestModal";
import type { VehicleWithDetails, Coordination } from "@/types/vehicle";

const links = [
  {
    label: "CRLV's",
    href: "https://bi-frota.lovable.app/regularizacao-documentos",
    icon: FileText,
    description: "Regularização de documentos",
  },
  {
    label: "Postos Credenciados",
    href: "https://bi-frota.lovable.app/postos",
    icon: MapPin,
    description: "Rede de postos",
  },
  {
    label: "Instruções iButtons",
    href: "http://bi-frota.lovable.app/procedimento-ligar-veiculo",
    icon: Key,
    description: "Como ligar o veículo",
  },
];

interface FabMenuProps {
  vehicles?: VehicleWithDetails[];
  coordinations?: Coordination[];
  selectedCoordinations?: string[];
}

export function FabMenu({ vehicles = [], coordinations = [], selectedCoordinations = [] }: FabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const handleTransferClick = () => {
    setIsOpen(false);
    setTransferModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* FAB Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30",
            "bg-primary text-primary-foreground",
            "border border-white/10 transition-colors duration-300",
            isOpen && "bg-muted text-foreground shadow-black/40",
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

              {/* Transfer Request button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
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

              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 1) * 0.05 }}
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
    </>
  );
}
