import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

function isLastThreeDaysOfMonth(): boolean {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() >= lastDay - 2;
}

export function EndOfMonthAlert() {
  const [dismissed, setDismissed] = useState(false);
  const shouldShow = useMemo(() => isLastThreeDaysOfMonth(), []);

  if (!shouldShow || dismissed) return null;

  return (
    <div className="w-full bg-[hsl(var(--balance-medium)/0.15)] border-b border-[hsl(var(--balance-medium)/0.3)] px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[hsl(var(--balance-medium))] shrink-0 mt-0.5" />
        <p className="text-sm text-foreground flex-1">
          <span className="font-semibold text-[hsl(var(--balance-medium))]">Atenção: </span>
          Estamos nos últimos dias do mês. Solicitamos a todos os condutores que realizem o abastecimento até o final do expediente, com o objetivo de zerar o saldo da frota.
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
