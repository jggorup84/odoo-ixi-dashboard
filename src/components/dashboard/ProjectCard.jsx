import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectCard({ project, tasksCount, blockedCount, totalRevenue, needsValidation }) {
  const getPriorityColor = (priority) => {
    const colors = {
      "P0": "bg-red-100 text-red-700",
      "P1": "bg-orange-100 text-orange-700",
      "P2": "bg-yellow-100 text-yellow-700",
      "P3": "bg-blue-100 text-blue-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      "En cours": "bg-green-100 text-green-700",
      "Bloqué": "bg-red-100 text-red-700",
      "À valider": "bg-yellow-100 text-yellow-700",
      "Terminé": "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-sm">{project.name}</h3>
              <p className="text-xs text-muted-foreground">{project.entity}</p>
            </div>
            {needsValidation && (
              <Badge className="bg-accent/20 text-accent border-accent/30">Jenn ✓</Badge>
            )}
          </div>

          {/* Status & Priority */}
          <div className="flex gap-2">
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Tâches</p>
              <p className="font-bold text-sm">{tasksCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Impact</p>
              <p className="font-bold text-sm text-primary">{totalRevenue ? `${totalRevenue}€` : "TBD"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Blocages</p>
              <p className={`font-bold text-sm ${blockedCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {blockedCount}
              </p>
            </div>
          </div>

          {/* Next Action */}
          {project.next_action && (
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs font-semibold text-foreground">→ {project.next_action}</p>
            </div>
          )}

          {/* Responsible */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{project.assigned_to}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}