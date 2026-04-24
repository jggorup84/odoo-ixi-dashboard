import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, change, changeLabel, icon: Icon, color, index = 0 }) {
  const isPositive = change >= 0;

  const colorMap = {
    blue: "bg-primary/10 text-primary",
    purple: "bg-accent/10 text-accent",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-amber-50 text-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            )}
            <span
              className={cn(
                "text-xs font-semibold",
                isPositive ? "text-emerald-500" : "text-destructive"
              )}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.blue)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}