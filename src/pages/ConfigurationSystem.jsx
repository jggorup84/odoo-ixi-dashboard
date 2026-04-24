import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Settings, Save, TestTube, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ConfigurationSystem() {
  const qc = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ["system_configs"],
    queryFn: () => base44.entities.SystemConfig.list(),
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ key, value, description }) => {
      const existing = configs.find(c => c.config_key === key);
      if (existing) return base44.entities.SystemConfig.update(existing.id, { config_value: value });
      return base44.entities.SystemConfig.create({ config_key: key, config_value: value, description });
    },
    onSuccess: () => { qc.invalidateQueries(["system_configs"]); toast.success("Configuration sauvegardée"); },
  });

  const getVal = (key) => configs.find(c => c.config_key === key)?.config_value || "";
  const isTestMode = getVal("ODOO_MODE") === "test";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Configuration système</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Paramètres de connexion Odoo et préférences</p>
      </div>

      {/* Mode Test/Prod */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isTestMode ? <TestTube className="w-5 h-5 text-amber-500" /> : <Globe className="w-5 h-5 text-emerald-500" />}
            <h3 className="font-semibold">Mode Odoo</h3>
          </div>
          <Badge variant="outline" className={isTestMode ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
            {isTestMode ? "TEST" : "PRODUCTION"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={!isTestMode}
            onCheckedChange={(v) => upsertMutation.mutate({ key: "ODOO_MODE", value: v ? "production" : "test", description: "Mode connexion Odoo" })}
          />
          <Label>{isTestMode ? "Basculer en Production" : "Basculer en Test"}</Label>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          ⚠️ Le mode Production utilise la base de données Odoo réelle. Le mode Test utilise des données de démonstration.
        </p>
      </motion.div>

      {/* Configs affichées */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Configurations actives</h3>
        {configs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune configuration enregistrée</p>
        ) : (
          <div className="space-y-3">
            {configs.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-mono font-medium">{c.config_key}</p>
                  {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                </div>
                <Badge variant="outline" className="text-xs font-mono">{c.config_value}</Badge>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}