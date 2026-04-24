import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Wrench, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const priorityColor = {
  basse: "bg-muted text-muted-foreground border-border",
  moyenne: "bg-amber-50 text-amber-700 border-amber-200",
  haute: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcon = {
  planifiée: <Clock className="w-4 h-4 text-muted-foreground" />,
  en_cours: <Wrench className="w-4 h-4 text-amber-500" />,
  terminée: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  annulée: <CheckCircle className="w-4 h-4 text-muted-foreground" />,
  en_attente: <AlertTriangle className="w-4 h-4 text-orange-500" />,
};

export default function Maintenance() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => base44.entities.PropertyMaintenance.list("-created_date"),
  });

  const filtered = items.filter(i => {
    const s = filterStatus === "all" || i.status === filterStatus;
    const p = filterPriority === "all" || i.priority === filterPriority;
    return s && p;
  });

  const critique = filtered.filter(i => i.priority === "critique" && i.status !== "terminée").length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} tâches {critique > 0 && `· ${critique} critiques`}</p>
        </div>
      </div>

      {critique > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">{critique} tâche(s) critique(s) nécessitent une attention immédiate</p>
        </div>
      )}

      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {["planifiée","en_cours","terminée","annulée","en_attente"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priorité" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {["basse","moyenne","haute","critique"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune tâche de maintenance</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                <div className="mt-0.5 shrink-0">{statusIcon[item.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <Badge variant="outline" className={cn("text-xs", priorityColor[item.priority])}>{item.priority}</Badge>
                    {item.blocks_property && <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">Bloque propriété</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.property_name} · {item.category}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  {item.scheduled_date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.scheduled_date), "dd MMM", { locale: fr })}
                    </p>
                  )}
                  {item.estimated_cost && <p className="text-xs font-medium">{item.estimated_cost}€</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}