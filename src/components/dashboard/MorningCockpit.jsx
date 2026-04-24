import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, DollarSign, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const PRIORITY_COLORS = {
  P0: "bg-red-100 text-red-700 border-red-300",
  P1: "bg-orange-100 text-orange-700 border-orange-300",
  P2: "bg-yellow-100 text-yellow-700 border-yellow-300",
  P3: "bg-blue-100 text-blue-700 border-blue-300",
  P4: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function MorningCockpit({ userRole = "gab" }) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-total_score", 100),
    refetchInterval: 60000,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => base44.entities.Branch.list(),
  });

  // Filtrer tâches selon rôle
  const myTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (userRole === "gab") return t.assigned_to === "Gab" || t.is_morning_priority;
        if (userRole === "jenn") return t.assigned_to === "Jenn" || t.status === "En attente Jenn";
        return true;
      })
      .slice(0, 10);
  }, [tasks, userRole]);

  const topPriorities = useMemo(() => {
    return tasks
      .filter(t => ["P0", "P1"].includes(t.priority))
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5);
  }, [tasks]);

  const blockedTasks = useMemo(() => {
    return tasks.filter(t => t.status === "Bloqué").slice(0, 5);
  }, [tasks]);

  const activeBranch = branches.find(b => b.status === "active");

  return (
    <div className="space-y-4">
      {/* Greeting + Quick Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-5">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bonjour {userRole === "gab" ? "Gab" : "Jenn"} 👋
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {activeBranch ? `Branche active: ${activeBranch.name}` : "Aucune branche sélectionnée"}
        </p>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Tâches urgentes</p>
            <p className="text-2xl font-bold text-destructive">{topPriorities.length}</p>
          </div>
          <div className="bg-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Bloquées</p>
            <p className="text-2xl font-bold text-warning">{blockedTasks.length}</p>
          </div>
          <div className="bg-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Mes tâches</p>
            <p className="text-2xl font-bold text-primary">{myTasks.length}</p>
          </div>
          <div className="bg-card rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Tâches totales</p>
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* Top 5 Priorités */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h3 className="font-bold text-lg">Top 5 priorités</h3>
        </div>
        <div className="space-y-2">
          {topPriorities.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border-2 ${PRIORITY_COLORS[task.priority]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{task.title}</p>
                  <p className="text-xs mt-1 opacity-80">{task.project} · {task.entity}</p>
                  {task.next_action && <p className="text-xs mt-1 italic">→ {task.next_action}</p>}
                </div>
                <div className="text-right text-xs ml-3">
                  <p className="font-bold">Score: {task.total_score || 0}</p>
                  {task.due_date && <p>{new Date(task.due_date).toLocaleDateString("fr-FR")}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mes tâches du jour */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-bold text-lg mb-3">Mes tâches</h3>
        <div className="space-y-2">
          {myTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
              <input type="checkbox" className="w-4 h-4 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.status}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Blocages */}
      {blockedTasks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-bold text-lg text-destructive mb-3">🚨 Blocages critiques</h3>
          <div className="space-y-2">
            {blockedTasks.map((task) => (
              <div key={task.id} className="bg-card p-3 rounded-lg border border-destructive/30">
                <p className="font-semibold text-sm">{task.title}</p>
                {task.blockers && <p className="text-xs text-muted-foreground mt-1">Raison: {task.blockers}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">+ Nouvelle tâche</Button>
        <Button variant="outline" className="flex-1">📞 Appeler Gab</Button>
        <Button variant="outline" className="flex-1">📧 Contacter Jenn</Button>
      </div>
    </div>
  );
}