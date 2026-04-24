import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function OdooMappingDashboard() {
  const [selectedMapping, setSelectedMapping] = useState(null);
  const queryClient = useQueryClient();

  const { data: mappings = [] } = useQuery({
    queryKey: ["odoo_mappings"],
    queryFn: () => base44.entities.OdooMapping.list(),
    refetchInterval: 30000,
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ["odoo_sync_logs"],
    queryFn: () => base44.entities.OdooSyncLog.list("-synced_at", 50),
    refetchInterval: 15000,
  });

  const bulkSyncMutation = useMutation({
    mutationFn: (mappingId) =>
      base44.functions.invoke("bulkSyncTasks", { mapping_id: mappingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odoo_sync_logs"] });
    },
  });

  const stats = {
    total_mappings: mappings.length,
    active_mappings: mappings.filter(m => m.is_active).length,
    recent_syncs: syncLogs.filter(l => new Date(l.synced_at) > new Date(Date.now() - 3600000)).length,
    failed_syncs: syncLogs.filter(l => l.status === 'failed').slice(0, 5),
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: <CheckCircle className="w-4 h-4 text-green-600" />,
      failed: <XCircle className="w-4 h-4 text-red-600" />,
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      warning: <AlertCircle className="w-4 h-4 text-orange-600" />,
    };
    return icons[status] || <Activity className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Mappings actifs", value: stats.active_mappings, icon: "🔗" },
          { label: "Syncs réussis", value: syncLogs.filter(l => l.status === 'success').length, icon: "✅" },
          { label: "Syncs échoués", value: stats.failed_syncs.length, icon: "❌" },
          { label: "Dernière heure", value: stats.recent_syncs, icon: "⏱️" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.icon} {stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Mappings List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Mappings Odoo</h3>
          <Button size="sm" variant="outline">+ Nouveau mapping</Button>
        </div>

        <div className="space-y-2">
          {mappings.map((mapping) => {
            const mappingLogs = syncLogs.filter(l => l.mapping_id === mapping.id);
            const successRate = mappingLogs.length > 0
              ? Math.round((mappingLogs.filter(l => l.status === 'success').length / mappingLogs.length) * 100)
              : 0;

            return (
              <motion.div
                key={mapping.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedMapping(mapping.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMapping === mapping.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{mapping.mapping_name}</p>
                      <Badge variant={mapping.is_active ? "default" : "secondary"}>
                        {mapping.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {mapping.mapping_direction}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mapping.base44_entity_type} ↔ {mapping.odoo_entity_type}
                    </p>
                    {mapping.last_sync_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière sync: {new Date(mapping.last_sync_at).toLocaleString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(mapping.last_sync_status)}
                      <span className="text-xs font-semibold">{successRate}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => bulkSyncMutation.mutate(mapping.id)}
                      disabled={bulkSyncMutation.isPending}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync maintenant
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Sync Logs */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4">Journal de synchronisation</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {syncLogs.slice(0, 20).map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="p-3 rounded-lg bg-muted/30 border border-border text-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {getStatusIcon(log.status)}
                  <div>
                    <p className="font-semibold">{log.mapping_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.base44_record_type} → {log.odoo_record_type}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.synced_at).toLocaleString("fr-FR")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}