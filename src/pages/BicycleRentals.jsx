import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Bike, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusColor = {
  reserved: "bg-primary/10 text-primary border-primary/20",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returned: "bg-muted text-muted-foreground border-border",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};
const statusLabel = { reserved: "Réservé", active: "En cours", returned: "Rendu", overdue: "En retard", cancelled: "Annulé" };

export default function BicycleRentals() {
  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ["bicycle_rentals"],
    queryFn: () => base44.entities.BicycleRental.list("-created_date"),
  });

  const stats = {
    active: rentals.filter(r => r.status === "active").length,
    overdue: rentals.filter(r => r.status === "overdue").length,
    reserved: rentals.filter(r => r.status === "reserved").length,
    total: rentals.length,
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Locations de vélos</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{stats.total} locations enregistrées</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "En cours", value: stats.active, icon: Bike, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "En retard", value: stats.overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Réservés", value: stats.reserved, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total", value: stats.total, icon: CheckCircle, color: "text-muted-foreground", bg: "bg-muted" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : rentals.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><Bike className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Aucune location</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Client","Vélo","Début","Fin","Montant","Statut"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rentals.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3"><p className="text-sm font-medium">{r.customer_name}</p></td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{r.bicycle_model}</p></td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{r.rental_start ? format(new Date(r.rental_start), "dd MMM", { locale: fr }) : "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{r.rental_end ? format(new Date(r.rental_end), "dd MMM", { locale: fr }) : "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-sm font-medium">{r.total_amount ? `${r.total_amount}€` : "—"}</p></td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={cn("text-xs", statusColor[r.status])}>
                      {statusLabel[r.status] || r.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}