import React from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import SalesChart from "../components/dashboard/SalesChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentOrders from "../components/dashboard/RecentOrders";

const stats = [
  {
    title: "Chiffre d'affaires",
    value: "284 560 €",
    change: 12.5,
    changeLabel: "vs mois dernier",
    icon: DollarSign,
    color: "blue",
  },
  {
    title: "Commandes",
    value: "1 847",
    change: 8.2,
    changeLabel: "vs mois dernier",
    icon: ShoppingCart,
    color: "purple",
  },
  {
    title: "Nouveaux clients",
    value: "342",
    change: -3.1,
    changeLabel: "vs mois dernier",
    icon: Users,
    color: "green",
  },
  {
    title: "Produits vendus",
    value: "5 623",
    change: 15.7,
    changeLabel: "vs mois dernier",
    icon: Package,
    color: "orange",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Tableau de bord</h2>
        <p className="text-muted-foreground mt-1">
          Bienvenue sur votre dashboard Odoo IXI — Vue d'ensemble de votre activité
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}