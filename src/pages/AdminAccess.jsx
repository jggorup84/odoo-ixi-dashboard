import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AdminAccess() {
  const { user } = useAuth();

  const { data: accesses = [], isLoading } = useQuery({
    queryKey: ["technician_accesses"],
    queryFn: () => base44.entities.TechnicianAccess.list("-access_date", 50),
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="w-16 h-16 text-destructive/30 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Accès refusé</h2>
        <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  const granted = accesses.filter(a => a.access_granted).length;
  const denied = accesses.filter(a => !a.access_granted).length;
  const trusted = accesses.filter(a => a.is_trusted_ip).length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-destructive" /> Sécurité & Accès</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Journal des tentatives d'accès — techniciens Odoo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Accès accordés", value: granted, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Accès refusés", value: denied, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "IPs de confiance", value: trusted, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : accesses.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune tentative d'accès enregistrée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Email","Entreprise","IP","Date","Statut","IP fiable"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accesses.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3"><p className="text-sm font-medium">{a.email}</p></td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{a.company || "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-xs font-mono text-muted-foreground">{a.ip_address || "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-xs text-muted-foreground">{a.access_date ? format(new Date(a.access_date), "dd MMM HH:mm", { locale: fr }) : "—"}</p></td>
                  <td className="px-5 py-3">
                    {a.access_granted
                      ? <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Accordé</Badge>
                      : <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">Refusé</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {a.is_trusted_ip ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
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