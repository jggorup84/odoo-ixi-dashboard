import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TaskOdooSync({ task, mappingId }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke("syncTaskToOdooLead", {
        task_id: task.id,
        mapping_id: mappingId,
      }),
    onSuccess: (response) => {
      toast.success(`✅ Tâche synchronisée vers Odoo (Lead #${response.data.odoo_lead_id})`);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["odoo_sync_logs"] });
    },
    onError: (error) => {
      toast.error(`❌ Erreur sync: ${error.message}`);
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    await syncMutation.mutateAsync();
  };

  // Si déjà synchronisée
  if (task.odoo_lead_id) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-xs font-semibold text-green-700">✓ Synced to Odoo</span>
        {task.odoo_lead_url && (
          <a
            href={task.odoo_lead_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-green-700 hover:underline"
          >
            Lead #{task.odoo_lead_id}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSync}
      disabled={isSyncing || syncMutation.isPending}
      className="w-full gap-2"
    >
      {isSyncing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Synchronisation...
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          Synchroniser vers Odoo
        </>
      )}
    </Button>
  );
}