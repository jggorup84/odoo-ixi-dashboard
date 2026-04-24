import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Home, Activity, Lightbulb, MessageSquare, Settings,
  TrendingUp, ClipboardList, Package, Wrench, Building2, AlertTriangle,
  FileText, Shield, ChevronLeft, ChevronRight, Bell, Search, LogOut,
  Bike, Users, BrainCircuit
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import NotificationBell from "./NotificationBell";
import { base44 } from "@/api/base44Client";

const navSections = [
  {
    label: "Vue générale",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: Activity, label: "Activité", path: "/ActivityLogs" },
      { icon: AlertTriangle, label: "Opérations", path: "/OperationsRentals" },
    ]
  },
  {
    label: "Propriétés",
    items: [
      { icon: Building2, label: "Propriétés", path: "/Properties" },
      { icon: Home, label: "Locations Airbnb", path: "/AirbnbRentals" },
      { icon: Wrench, label: "Maintenance", path: "/Maintenance" },
      { icon: Package, label: "Inventaire", path: "/Inventory" },
      { icon: Users, label: "Expériences", path: "/GuestExperiences" },
    ]
  },
  {
    label: "Vélos",
    items: [
      { icon: Bike, label: "Locations Vélos", path: "/BicycleRentals" },
      { icon: TrendingUp, label: "Ventes Vélos", path: "/BicycleSales" },
    ]
  },
  {
    label: "Analyse",
    items: [
      { icon: TrendingUp, label: "Finances", path: "/FinancialAnalysis" },
      { icon: Lightbulb, label: "Insights", path: "/BusinessInsights" },
      { icon: MessageSquare, label: "Chat IA", path: "/ChatOdoo" },
    ]
  },
  {
    label: "Coaching",
    items: [
      { icon: BrainCircuit, label: "Coach d'affaires", path: "/CoachAffaires" },
    ]
  },
  {
    label: "Système",
    items: [
      { icon: Settings, label: "Configuration", path: "/ConfigurationSystem" },
      { icon: Shield, label: "Admin", path: "/AdminAccess" },
      { icon: FileText, label: "Documentation", path: "/DocumentationOdoo" },
    ]
  }
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const handleLogout = () => base44.auth.logout();

  return (
    <div className="min-h-screen bg-background flex font-inter">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 248 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col border-r border-sidebar-border shrink-0"
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-black text-xs">🐨</span>
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sidebar-foreground font-bold text-sm leading-tight">KOALAS ERP</p>
                <p className="text-sidebar-foreground/40 text-xs">Odoo IXI Dashboard</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-sidebar-foreground/30 text-xs font-semibold uppercase tracking-widest px-2 mb-1">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-sm group relative",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors text-sm"
            title={collapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Réduire</span></>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 68 : 248 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 w-56 h-8 bg-muted/50 border-none text-sm" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="h-7 w-px bg-border" />
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">K</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-5">
          {children}
        </main>

        <footer className="border-t border-border py-3 px-6">
          <p className="text-xs text-muted-foreground text-center">
            🐨 KOALAS ERP · Odoo IXI Dashboard · {new Date().getFullYear()}
          </p>
        </footer>
      </motion.div>
    </div>
  );
}