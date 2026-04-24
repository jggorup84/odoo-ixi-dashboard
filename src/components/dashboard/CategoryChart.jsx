import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Électronique", value: 35 },
  { name: "Mobilier", value: 25 },
  { name: "Textile", value: 20 },
  { name: "Alimentaire", value: 12 },
  { name: "Autres", value: 8 },
];

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(220, 9%, 46%)",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card rounded-lg shadow-lg border border-border px-3 py-2">
      <p className="text-sm font-medium text-card-foreground">{payload[0].name}</p>
      <p className="text-xs text-muted-foreground">{payload[0].value}% du total</p>
    </div>
  );
};

export default function CategoryChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="bg-card rounded-xl p-6 shadow-sm border border-border"
    >
      <h3 className="text-lg font-semibold text-card-foreground">Répartition par catégorie</h3>
      <p className="text-sm text-muted-foreground mt-0.5 mb-4">Ventes par type de produit</p>

      <div className="flex items-center gap-6">
        <div className="w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-card-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-card-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}