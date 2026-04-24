import React from "react";
import { AlertTriangle, TrendingDown, Info } from "lucide-react";

export default function CashFlowAlert({ gapFinancement, totalBudgetNeeded, totalBudgetAvail, totalFinancingObtained, blockedCount }) {
  const isUrgent = gapFinancement > 0;
  const coverRatio = totalBudgetNeeded > 0 ? Math.round(((totalBudgetAvail + totalFinancingObtained) / totalBudgetNeeded) * 100) : 100;

  return (
    <div className={`rounded-xl border-2 p-4 ${isUrgent ? "border-red-400 bg-red-50" : "border-green-300 bg-green-50"}`}>
      <div className="flex items-start gap-3">
        {isUrgent ? <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <p className={`font-bold text-sm ${isUrgent ? "text-red-700" : "text-green-700"}`}>
            {isUrgent
              ? `⚠ GAP DE FINANCEMENT : ${gapFinancement.toLocaleString("fr-FR")} € à couvrir`
              : "✓ Financement couvert"}
          </p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs">
            <span className="text-muted-foreground">Budget total nécessaire : <strong className="text-foreground">{totalBudgetNeeded.toLocaleString("fr-FR")} €</strong></span>
            <span className="text-muted-foreground">Disponible : <strong className="text-foreground">{totalBudgetAvail.toLocaleString("fr-FR")} €</strong></span>
            <span className="text-muted-foreground">Obtenu : <strong className="text-emerald-700">{totalFinancingObtained.toLocaleString("fr-FR")} €</strong></span>
            {blockedCount > 0 && <span className="text-red-600 font-semibold">{blockedCount} projet(s) bloqué(s) — action immédiate requise</span>}
          </div>
          {/* Barre de couverture */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Couverture financière</span>
              <span className={`font-bold ${coverRatio >= 100 ? "text-green-600" : coverRatio >= 60 ? "text-amber-600" : "text-red-600"}`}>{coverRatio}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${coverRatio >= 100 ? "bg-green-500" : coverRatio >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(coverRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}