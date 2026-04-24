import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mois: "Jan", ventes: 4200, objectif: 4000 },
  { mois: "Fév", ventes: 3800, objectif: 4200 },
  { mois: "Mar", ventes: 5100, objectif: 4500 },
  { mois: "Avr", ventes: 4700, objectif: 4800 },
  { mois: "Mai", ventes: 5800, objectif: 5000 },
  { mois: "Jun", ventes: 6200, objectif: 5200 },
  { mois: "Jul", ventes: 5900, objectif: 5500 },
  { mois: "Aoû", ventes: 6800, objectif: 5800 },
  { mois: "Sep", ventes: 7200, objectif: 6000 },
  { mois: "Oct", ventes: 6500, objectif: 6200 },
  { mois: "Nov", ventes: 7800, objectif: 6500 },
  { mois: "Déc", ventes: 8400, objectif: 7000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-3">
      <p className="text-sm font-semibold text-card-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name === "ventes" ? "Ventes" : "Objectif"}: {entry.value.toLocaleString("fr-FR")} €
        </p>
      ))}
    </div>
  );
};

export default function SalesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-card rounded-xl p-6 shadow-sm border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Évolution des ventes</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Comparaison ventes vs objectif mensuel</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Ventes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Objectif</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorObjectif" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
          <XAxis
            dataKey="mois"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="ventes"
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={2.5}
            fill="url(#colorVentes)"
          />
          <Area
            type="monotone"
            dataKey="objectif"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="url(#colorObjectif)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}