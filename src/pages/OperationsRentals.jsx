import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { AlertTriangle, Home, Bike, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function OperationsRentals() {
  const { data: airbnb = [] } = useQuery({
    queryKey: ["airbnb_ops"],
    queryFn: () => base44.entities.AirbnbRental.filter({ status: "in_progress" }, "-check_in"),
    refetchInterval: 60000,
  });

  const { data: checkinsToday = [] } = useQuery({
    queryKey: ["checkins_today"],
    queryFn: () => base44.entities.AirbnbRental.filter({ status: "confirmed" }, "-check_in", 20),
    refetchInterval: 60000,
  });

  const { data: overdueRentals = [] } = useQuery({
    queryKey: ["overdue"],
    queryFn: () => base44.entities.BicycleRental.filter({ status: "overdue" }, "-rental_end"),
    refetchInterval: 60000,
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance_urgent"],
    queryFn: () => base44.entities.PropertyMaintenance.filter({ priority: "critique" }, "-created_date"),
    refetchInterval: 60000,
  });

  const today = new Date().toISOString().split("T")[0];
  const todayCheckins = checkinsToday.filter(r => r.check_in?.startsWith(today));
  const todayCheckouts = airbnb.filter(r => r.check_out?.startsWith(today));

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Opérations centralisées</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Vue temps réel — {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
      </div>

      {/* Alertes critiques */}
      {(overdueRentals.length > 0 || maintenance.length > 0) && (
        <div className="space-y-2">
          {overdueRentals.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{overdueRentals.length} location(s) vélo en retard</p>
            </div>
          )}
          {maintenance.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700 font-medium">{maintenance.length} maintenance(s) critique(s)</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Check-ins aujourd'hui */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Check-ins aujourd'hui ({todayCheckins.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {todayCheckins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun check-in prévu</p>
            ) : todayCheckins.map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{r.property_name}</p>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{r.platform}</Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Check-outs aujourd'hui */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Home className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Check-outs aujourd'hui ({todayCheckouts.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {todayCheckouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun check-out prévu</p>
            ) : todayCheckouts.map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{r.property_name}</p>
                </div>
                <p className="text-xs font-medium text-foreground">{r.total_amount?.toLocaleString("fr-FR")} €</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vélos en retard */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Bike className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-sm">Vélos en retard ({overdueRentals.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {overdueRentals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun retard 🎉</p>
            ) : overdueRentals.map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{r.bicycle_model}</p>
                </div>
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                  {r.rental_end ? `+${differenceInDays(new Date(), new Date(r.rental_end))}j` : "retard"}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenances critiques */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Maintenances critiques ({maintenance.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {maintenance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune urgence ✅</p>
            ) : maintenance.map(m => (
              <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.property_name} · {m.category}</p>
                </div>
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">{m.status}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}