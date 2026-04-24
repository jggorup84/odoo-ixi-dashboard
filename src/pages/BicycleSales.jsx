import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeColor = {
  mountain: "bg-emerald-50 text-emerald-700 border-emerald-200",
  road: "bg-primary/10 text-primary border-primary/20",
  electric: "bg-amber-50 text-amber-700 border-amber-200",
  city: "bg-accent/10 text-accent border-accent/20",
  hybrid: "bg-muted text-muted-foreground border-border",
};

export default function BicycleSales() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["bicycle_sales"],
    queryFn: () => base44.entities.BicycleSale.list("-sale_date"),
  });

  const totalRevenue = sales.reduce((s, r) => s + (r.sale_price || 0), 0);
  const totalMargin = sales.reduce((s, r) => s + (r.margin || 0), 0);
  const avgMargin = sales.length > 0 ? totalMargin / sales.length : 0;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Ventes de vélos</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{sales.length} ventes enregistrées</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "CA total", value: `${totalRevenue.toLocaleString("fr-FR")} €`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Marge totale", value: `${totalMargin.toLocaleString("fr-FR")} €`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Marge moyenne", value: `${avgMargin.toLocaleString("fr-FR")} €`, icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50" },
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
        ) : sales.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Aucune vente</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Client","Modèle","Type","Date","Prix vente","Marge"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3"><p className="text-sm font-medium">{s.customer_name}</p></td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{s.bicycle_model}</p></td>
                  <td className="px-5 py-3">
                    <Badge variant="outline" className={`text-xs ${typeColor[s.bicycle_type] || ""}`}>{s.bicycle_type}</Badge>
                  </td>
                  <td className="px-5 py-3"><p className="text-sm text-muted-foreground">{s.sale_date ? format(new Date(s.sale_date), "dd MMM yyyy", { locale: fr }) : "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-sm font-semibold">{s.sale_price ? `${s.sale_price.toLocaleString("fr-FR")} €` : "—"}</p></td>
                  <td className="px-5 py-3"><p className="text-sm font-medium text-emerald-600">{s.margin ? `${s.margin.toLocaleString("fr-FR")} €` : "—"}</p></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}