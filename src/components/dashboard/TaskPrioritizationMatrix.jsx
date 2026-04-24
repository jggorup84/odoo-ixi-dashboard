import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const SCORE_FORMULA = (task) => {
  return (task.urgence_score || 0) +
         (task.impact_money_score || 0) +
         (task.impact_client_score || 0) +
         (task.risk_score || 0) +
         (task.blocage_score || 0);
};

export default function TaskPrioritizationMatrix() {
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list(),
  });

  // Calculer les scores si manquants
  const enrichedTasks = useMemo(() => {
    return tasks.map(t => ({
      ...t,
      total_score: t.total_score || SCORE_FORMULA(t),
    })).sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
  }, [tasks]);

  const P0Tasks = enrichedTasks.filter(t => t.total_score >= 20);
  const P1Tasks = enrichedTasks.filter(t => t.total_score >= 15 && t.total_score < 20);
  const P2Tasks = enrichedTasks.filter(t => t.total_score >= 10 && t.total_score < 15);
  const P3Tasks = enrichedTasks.filter(t => t.total_score >= 5 && t.total_score < 10);
  const P4Tasks = enrichedTasks.filter(t => t.total_score < 5);

  const renderTaskGroup = (priority, tasks, color) => (
    <div key={priority} className={`border-2 rounded-lg p-3 ${color}`}>
      <p className="font-bold text-sm mb-2">{priority} ({tasks.length})</p>
      <div className="space-y-1">
        {tasks.slice(0, 5).map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/50 rounded p-2 text-xs"
          >
            <p className="font-semibold truncate">{task.title}</p>
            <p className="text-muted-foreground text-xs">Score: {task.total_score}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Matrice de décision: Urgence + Impact argent + Impact client + Risque + Blocage
      </p>
      <div className="grid grid-cols-5 gap-2">
        {renderTaskGroup("P0", P0Tasks, "border-red-500 bg-red-50")}
        {renderTaskGroup("P1", P1Tasks, "border-orange-500 bg-orange-50")}
        {renderTaskGroup("P2", P2Tasks, "border-yellow-500 bg-yellow-50")}
        {renderTaskGroup("P3", P3Tasks, "border-blue-500 bg-blue-50")}
        {renderTaskGroup("P4", P4Tasks, "border-gray-500 bg-gray-50")}
      </div>
    </div>
  );
}