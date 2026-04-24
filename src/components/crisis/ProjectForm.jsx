import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const ENTITIES = ["KOALAS France SARL", "9419 Inc (Holding)", "Vélos Dordogne", "Atelier Cyclo", "SCI Dordogne", "Autre"];

export default function ProjectForm({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project?.name || "",
    category: project?.category || "operations",
    status: project?.status || "non_démarré",
    priority: project?.priority || "haute",
    deadline: project?.deadline || "",
    assigned_to: project?.assigned_to || "",
    entity_linked: project?.entity_linked || "",
    budget_needed: project?.budget_needed || "",
    budget_available: project?.budget_available || "",
    completion_percent: project?.completion_percent || 0,
    description: project?.description || "",
    blockers: project?.blockers || "",
    next_action: project?.next_action || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      budget_needed: form.budget_needed ? parseFloat(form.budget_needed) : undefined,
      budget_available: form.budget_available ? parseFloat(form.budget_available) : undefined,
      completion_percent: parseInt(form.completion_percent) || 0,
    };
    if (project?.id) {
      await base44.entities.Project.update(project.id, data);
    } else {
      await base44.entities.Project.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{project ? "Modifier le projet" : "Nouveau projet"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nom du projet *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="ex: Site web Atelier Cyclo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Priorité</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.priority} onChange={e => set("priority", e.target.value)}>
                {["critique","haute","moyenne","basse"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
                {["non_démarré","en_cours","bloqué","terminé","annulé"].map(v => <option key={v} value={v}>{v.replace("_"," ")}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deadline *</label>
              <Input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Entité</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.entity_linked} onChange={e => set("entity_linked", e.target.value)}>
                <option value="">-- Choisir --</option>
                {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Budget nécessaire (€)</label>
              <Input type="number" value={form.budget_needed} onChange={e => set("budget_needed", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Budget disponible (€)</label>
              <Input type="number" value={form.budget_available} onChange={e => set("budget_available", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Responsable</label>
            <Input value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)} placeholder="Nom de la personne assignée" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prochaine action</label>
            <Input value={form.next_action} onChange={e => set("next_action", e.target.value)} placeholder="ex: Appeler la banque pour le dossier de prêt" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Blocages actuels</label>
            <Input value={form.blockers} onChange={e => set("blockers", e.target.value)} placeholder="ex: Manque de trésorerie, attente réponse notaire..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Avancement ({form.completion_percent}%)</label>
            <input type="range" min="0" max="100" value={form.completion_percent} onChange={e => set("completion_percent", e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description / Notes</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Contexte, objectifs, détails..."
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.deadline}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}