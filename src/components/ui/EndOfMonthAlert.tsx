import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

function isLastThreeDaysOfMonth(): boolean {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() >= lastDay - 2;
}

export function EndOfMonthAlert() {
  const [dismissed, setDismissed] = React.useState(false);
  const shouldShow = React.useMemo(() => isLastThreeDaysOfMonth(), []);

  if (!shouldShow || dismissed) return null;

  return (
    <div className="z-40 w-full bg-[hsl(var(--balance-medium)/0.12)] border border-[hsl(var(--balance-medium)/0.25)] rounded-xl px-4 py-3 my-3 sm:my-4">
      <div className="max-w-[1920px] mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[hsl(var(--balance-medium))] shrink-0 mt-0.5" />
        <p className="text-sm text-foreground flex-1">
          <span className="font-semibold text-[hsl(var(--balance-medium))]">Atenção: </span>
          Estamos no período final do mês. Pedimos a todos os condutores que antecipem seus abastecimentos e os realizem o quanto antes, garantindo assim o consumo total do saldo disponível da frota antes do fechamento.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-md hover:bg-[hsl(var(--balance-medium)/0.2)] transition-colors"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
