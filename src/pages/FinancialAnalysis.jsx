import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { TrendingUp, Home, DollarSign, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinancialAnalysis() {
  const { data: properties = [] } = useQuery({ queryKey: ["properties_fin"], queryFn: () => base44.entities.Property.list() });
  const { data: rentals = [] } = useQuery({ queryKey: ["rentals_fin"], queryFn: () => base44.entities.AirbnbRental.filter({ status: "completed" }) });
  const { data: maintenance = [] } = useQuery({ queryKey: ["maintenance_fin"], queryFn: () => base44.entities.PropertyMaintenance.filter({ status: "terminée" }) });

  const totalRevenue = rentals.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalMaintCost = maintenance.reduce((s, m) => s + (m.actual_cost || m.estimated_cost || 0), 0);
  const netProfit = totalRevenue - totalMaintCost;

  const propData = properties.map(p => {
    const propRentals = rentals.filter(r => r.property_name === p.name);
    const propRevenue = propRentals.reduce((s, r) => s + (r.total_amount || 0), 0);
    const propCosts = maintenance.filter(m => m.property_name === p.name).reduce((s, m) => s + (m.actual_cost || m.estimated_cost || 0), 0);
    return { name: p.name?.substring(0, 15), revenus: propRevenue, coûts: propCosts, profit: propRevenue - propCosts };
  }).filter(p => p.revenus > 0);

  const kpis = [
    { label: "Revenus totaux", value: `${totalRevenue.toLocaleString("fr-FR")} €`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Coûts maintenance", value: `${totalMaintCost.toLocaleString("fr-FR")} €`, icon: Home, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Profit net", value: `${netProfit.toLocaleString("fr-FR")} €`, icon: TrendingUp, color: netProfit >= 0 ? "text-emerald-500" : "text-destructive", bg: netProfit >= 0 ? "bg-emerald-50" : "bg-destructive/10" },
    { label: "Propriétés actives", value: properties.filter(p => p.status === "active").length, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Analyse financière</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Rentabilité des propriétés — données réelles</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {propData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Revenus vs Coûts par propriété</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `${v.toLocaleString("fr-FR")} €`} />
              <Legend />
              <Bar dataKey="revenus" fill="hsl(221, 83%, 53%)" radius={[4,4,0,0]} name="Revenus" />
              <Bar dataKey="coûts" fill="hsl(38, 92%, 50%)" radius={[4,4,0,0]} name="Coûts" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {propData.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune donnée financière disponible</p>
          <p className="text-xs mt-1">Synchronisez Odoo pour voir les données réelles</p>
        </div>
      )}
    </div>
  );
}