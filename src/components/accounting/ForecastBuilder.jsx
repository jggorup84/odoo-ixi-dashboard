import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Download } from "lucide-react";
import { motion } from "framer-motion";

const ENTITIES = ["KOALAS France SARL", "9419 Inc (Holding)", "Vélos Dordogne", "Atelier Cyclo", "SCI Dordogne"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default function ForecastBuilder() {
  const [selectedEntity, setSelectedEntity] = useState("Consolidé");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [editingMonth, setEditingMonth] = useState(null);
  const [newForecast, setNewForecast] = useState({});

  const { data: forecasts = [] } = useQuery({
    queryKey: ["forecasts"],
    queryFn: () => base44.entities.FinancialForecast.list("-forecast_year", 500),
  });

  const forecastData = useMemo(() => {
    return forecasts.filter(f => f.entity === selectedEntity && f.forecast_year === selectedYear)
      .sort((a, b) => a.month - b.month);
  }, [forecasts, selectedEntity, selectedYear]);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const f = forecastData.find(x => x.month === i + 1);
      return {
        month: MONTHS[i],
        revenue: f?.revenue || 0,
        expenses: (f?.operating_expenses || 0) + (f?.salaries || 0) + (f?.rent || 0),
        ebitda: (f?.revenue || 0) - ((f?.operating_expenses || 0) + (f?.salaries || 0) + (f?.rent || 0)),
      };
    });
  }, [forecastData]);

  const totals = useMemo(() => {
    return {
      revenue: chartData.reduce((s, m) => s + m.revenue, 0),
      expenses: chartData.reduce((s, m) => s + m.expenses, 0),
      ebitda: chartData.reduce((s, m) => s + m.ebitda, 0),
    };
  }, [chartData]);

  const handleSaveForecast = async (month) => {
    const data = { ...newForecast, entity: selectedEntity, forecast_year: selectedYear, month };
    const existing = forecastData.find(f => f.month === month);
    if (existing) {
      await base44.entities.FinancialForecast.update(existing.id, data);
    } else {
      await base44.entities.FinancialForecast.create(data);
    }
    setEditingMonth(null);
    setNewForecast({});
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-3 items-center">
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedEntity} onChange={e => setSelectedEntity(e.target.value)}>
          <option value="Consolidé">Consolidé (Toutes entités)</option>
          {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
          {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <Button size="sm" variant="outline" className="gap-2 ml-auto">
          <Download className="w-4 h-4" />
          Exporter PDF pour comptable
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenu total {selectedYear}</p>
          <p className="text-2xl font-bold text-foreground">{totals.revenue.toLocaleString("fr-FR")} €</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Dépenses totales {selectedYear}</p>
          <p className="text-2xl font-bold text-destructive">{totals.expenses.toLocaleString("fr-FR")} €</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">EBITDA {selectedYear}</p>
          <p className={`text-2xl font-bold ${totals.ebitda >= 0 ? "text-success" : "text-destructive"}`}>{totals.ebitda.toLocaleString("fr-FR")} €</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val) => val.toLocaleString("fr-FR")} />
            <Legend />
            <Bar dataKey="revenue" fill="#0ea5e9" />
            <Bar dataKey="expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly edit grid */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm font-semibold mb-3">Détail mensuel {selectedYear}</p>
        <div className="grid grid-cols-6 gap-2">
          {MONTHS.map((month, idx) => {
            const monthNum = idx + 1;
            const data = forecastData.find(f => f.month === monthNum);
            const isEditing = editingMonth === monthNum;

            return (
              <motion.div key={monthNum} className={`rounded-lg p-3 cursor-pointer border-2 transition-all ${isEditing ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-muted/50"}`} onClick={() => setEditingMonth(isEditing ? null : monthNum)}>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{month}</p>

                {isEditing ? (
                  <div className="space-y-1">
                    <Input type="number" placeholder="Revenu" step="1000" value={newForecast.revenue || ""} onChange={e => setNewForecast(f => ({ ...f, revenue: parseFloat(e.target.value) || 0 }))} className="h-7 text-xs" />
                    <Input type="number" placeholder="Charges" step="1000" value={newForecast.operating_expenses || ""} onChange={e => setNewForecast(f => ({ ...f, operating_expenses: parseFloat(e.target.value) || 0 }))} className="h-7 text-xs" />
                    <Button size="sm" onClick={() => handleSaveForecast(monthNum)} className="w-full h-6 text-xs">Valider</Button>
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">Rev:</span> <strong className="text-success">{(data?.revenue || 0).toLocaleString("fr-FR")}</strong></p>
                    <p><span className="text-muted-foreground">Chg:</span> <strong className="text-destructive">{(data?.operating_expenses || 0).toLocaleString("fr-FR")}</strong></p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Note for accountant */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p className="font-semibold mb-1">📊 Prévisionnel pour prêt reno 50K€</p>
        <p>Cette prévision 3 ans (2026-2028) sera validée par votre comptable et servira de base pour la demande de prêt reno auprès des banques (J+7 max).</p>
      </div>
    </div>
  );
}