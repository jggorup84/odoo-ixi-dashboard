import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function OdooConfigForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    mapping_name: "",
    odoo_instance_url: "https://",
    odoo_database: "",
    odoo_entity_type: "lead",
    base44_entity_type: "Task",
    mapping_direction: "base44_to_odoo",
    trigger_condition: "status === 'En cours'",
    sync_frequency: "real_time",
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.OdooMapping.create(formData),
    onSuccess: () => {
      toast.success("✅ Configuration créée avec succès");
      queryClient.invalidateQueries({ queryKey: ["odoo_mappings"] });
      setFormData({
        mapping_name: "",
        odoo_instance_url: "https://",
        odoo_database: "",
        odoo_entity_type: "lead",
        base44_entity_type: "Task",
        mapping_direction: "base44_to_odoo",
        trigger_condition: "status === 'En cours'",
        sync_frequency: "real_time",
      });
    },
    onError: (error) => {
      toast.error(`❌ Erreur: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Card className="p-4 max-w-lg">
      <h3 className="font-bold text-lg mb-4">Créer un nouveau mapping</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold">Nom du mapping</label>
          <Input
            placeholder="Ex: Tâches → Leads Odoo"
            value={formData.mapping_name}
            onChange={(e) => setFormData({ ...formData, mapping_name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">URL Odoo</label>
            <Input
              placeholder="https://odoo.example.com"
              value={formData.odoo_instance_url}
              onChange={(e) => setFormData({ ...formData, odoo_instance_url: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Base de données</label>
            <Input
              placeholder="db_name"
              value={formData.odoo_database}
              onChange={(e) => setFormData({ ...formData, odoo_database: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">Entité Odoo</label>
            <select
              className="w-full h-9 rounded-md border border-input px-3 text-sm"
              value={formData.odoo_entity_type}
              onChange={(e) => setFormData({ ...formData, odoo_entity_type: e.target.value })}
            >
              <option value="lead">Lead (CRM)</option>
              <option value="opportunity">Opportunité</option>
              <option value="sale_order">Commande de vente</option>
              <option value="invoice">Facture</option>
              <option value="res_partner">Partenaire</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold">Entité Base44</label>
            <select
              className="w-full h-9 rounded-md border border-input px-3 text-sm"
              value={formData.base44_entity_type}
              onChange={(e) => setFormData({ ...formData, base44_entity_type: e.target.value })}
            >
              <option value="Task">Tâche</option>
              <option value="Project">Projet</option>
              <option value="FinancingPlan">Plan de financement</option>
              <option value="Expense">Dépense</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Direction de sync</label>
          <select
            className="w-full h-9 rounded-md border border-input px-3 text-sm"
            value={formData.mapping_direction}
            onChange={(e) => setFormData({ ...formData, mapping_direction: e.target.value })}
          >
            <option value="base44_to_odoo">Base44 → Odoo</option>
            <option value="odoo_to_base44">Odoo → Base44</option>
            <option value="bidirectional">Bi-directionnel</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Fréquence de sync</label>
          <select
            className="w-full h-9 rounded-md border border-input px-3 text-sm"
            value={formData.sync_frequency}
            onChange={(e) => setFormData({ ...formData, sync_frequency: e.target.value })}
          >
            <option value="real_time">Temps réel</option>
            <option value="hourly">Toutes les heures</option>
            <option value="daily">Quotidienne</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Condition de déclenchement</label>
          <Input
            placeholder="Ex: status === 'En cours'"
            value={formData.trigger_condition}
            onChange={(e) => setFormData({ ...formData, trigger_condition: e.target.value })}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Syntaxe JavaScript simple (condition booléenne)
          </p>
        </div>

        <Button type="submit" disabled={createMutation.isPending} className="w-full gap-2">
          {createMutation.isPending ? "Création..." : <><Plus className="w-4 h-4" /> Créer le mapping</>}
        </Button>
      </form>
    </Card>
  );
}