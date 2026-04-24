import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Lightbulb, CheckCircle, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const impactColor = {
  faible: "bg-muted text-muted-foreground border-border",
  moyen: "bg-amber-50 text-amber-700 border-amber-200",
  élevé: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcon = {
  opportunité: <TrendingUp className="w-4 h-4 text-emerald-500" />,
  risque: <AlertTriangle className="w-4 h-4 text-destructive" />,
  tendance: <Zap className="w-4 h-4 text-primary" />,
  anomalie: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  recommandation: <Lightbulb className="w-4 h-4 text-primary" />,
};

export default function BusinessInsights() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => base44.entities.BusinessInsight.list("-created_date"),
  });

  const actionMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessInsight.update(id, { is_actioned: true }),
    onSuccess: () => qc.invalidateQueries(["insights"]),
  });

  const filtered = filter === "all" ? insights : filter === "pending" ? insights.filter(i => !i.is_actioned) : insights.filter(i => i.is_actioned);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Insights</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Analyses stratégiques et recommandations IA</p>
        </div>
        <div className="flex gap-2">
          {["all","pending","actioned"].map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "Tous" : f === "pending" ? "En attente" : "Traités"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-16 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun insight trouvé</p>
          </div>
        ) : (
          filtered.map((insight, i) => (
            <motion.div key={insight.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("bg-card rounded-xl border p-5 transition-all", insight.is_actioned ? "border-border opacity-60" : "border-border hover:shadow-md")}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {typeIcon[insight.insight_type]}
                  <span className="text-xs font-medium text-muted-foreground capitalize">{insight.insight_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", impactColor[insight.impact_level])}>
                    Impact {insight.impact_level}
                  </Badge>
                  {insight.is_actioned && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{insight.insight_title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{insight.description}</p>
              {insight.financial_impact && (
                <p className="text-xs text-emerald-600 font-medium mb-2">💰 Impact financier: {insight.financial_impact?.toLocaleString("fr-FR")} €</p>
              )}
              {insight.suggested_actions?.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  {insight.suggested_actions.slice(0, 2).map((a, j) => <li key={j} className="flex items-center gap-1.5"><span className="w-1 h-1 bg-primary rounded-full shrink-0" />{a}</li>)}
                </ul>
              )}
              {!insight.is_actioned && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => actionMutation.mutate(insight.id)}>
                  <CheckCircle className="w-3.5 h-3.5" /> Marquer traité
                </Button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}