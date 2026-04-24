import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Home, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusColor = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};
const statusLabel = { pending: "En attente", confirmed: "Confirmé", in_progress: "En cours", completed: "Terminé", cancelled: "Annulé" };

export default function AirbnbRentals() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ["airbnb_rentals"],
    queryFn: () => base44.entities.AirbnbRental.list("-check_in"),
  });

  const filtered = rentals.filter(r => {
    const s = filterStatus === "all" || r.status === filterStatus;
    const p = filterPlatform === "all" || r.platform === filterPlatform;
    return s && p;
  });

  const totalRevenue = filtered.filter(r => r.status === "completed").reduce((s, r) => s + (r.total_amount || 0), 0);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Locations Airbnb / Booking</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} réservations · CA: {totalRevenue.toLocaleString("fr-FR")} €</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {Object.entries(statusLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Plateforme" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="airbnb">Airbnb</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><Home className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Aucune réservation</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Voyageur","Propriété","Arrivée","Départ","Montant","Plateforme","Statut"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium">{r.guest_name}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-muted-foreground">{r.property_name}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-muted-foreground">{r.check_in ? format(new Date(r.check_in), "dd MMM", { locale: fr }) : "—"}</p></td>
                  <td className="px-4 py-3"><p className="text-sm text-muted-foreground">{r.check_out ? format(new Date(r.check_out), "dd MMM", { locale: fr }) : "—"}</p></td>
                  <td className="px-4 py-3"><p className="text-sm font-semibold">{r.total_amount ? `${r.total_amount.toLocaleString("fr-FR")} €` : "—"}</p></td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{r.platform}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-xs", statusColor[r.status])}>{statusLabel[r.status]}</Badge>
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