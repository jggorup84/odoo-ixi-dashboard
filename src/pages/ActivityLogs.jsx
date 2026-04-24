import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusIcon = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  failed: <XCircle className="w-4 h-4 text-destructive" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  cancelled: <XCircle className="w-4 h-4 text-muted-foreground" />,
};

const statusBadge = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function ActivityLogs() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 100),
    refetchInterval: 15000,
  });

  const filtered = logs.filter(l => {
    const typeOk = filterType === "all" || l.activity_type === filterType;
    const statusOk = filterStatus === "all" || l.status === filterStatus;
    return typeOk && statusOk;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activité système</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} entrée(s) · Rafraîchissement auto 15s</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {["agent_action","webhook_received","sync_started","sync_completed","sync_failed","user_action","system_event"].map(t => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {["pending","success","failed","cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune activité trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className="shrink-0">{statusIcon[log.status] || statusIcon.pending}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{log.action_name}</p>
                  <p className="text-xs text-muted-foreground">{log.entity_type} {log.user_email ? `· ${log.user_email}` : ""}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs shrink-0", statusBadge[log.status])}>
                  {log.status}
                </Badge>
                <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
                  {log.activity_type?.replace(/_/g, " ")}
                </Badge>
                {log.duration_ms && <span className="text-xs text-muted-foreground shrink-0">{log.duration_ms}ms</span>}
                <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
                  {log.created_date ? format(new Date(log.created_date), "dd MMM HH:mm", { locale: fr }) : "—"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}