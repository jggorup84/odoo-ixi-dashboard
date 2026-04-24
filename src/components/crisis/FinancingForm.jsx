import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function FinancingForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    type: "pret_bancaire",
    status: "en_preparation",
    amount_requested: "",
    amount_obtained: "",
    interest_rate: "",
    duration_months: "",
    monthly_payment: "",
    contact_name: "",
    contact_institution: "",
    deadline_submission: "",
    decision_date: "",
    project_linked: "",
    entity_linked: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Calcul mensualité automatique
  const calcMensualite = () => {
    const P = parseFloat(form.amount_requested);
    const r = parseFloat(form.interest_rate) / 100 / 12;
    const n = parseInt(form.duration_months);
    if (P && r && n) {
      const m = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      set("monthly_payment", Math.round(m));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.FinancingPlan.create({
      ...form,
      amount_requested: parseFloat(form.amount_requested) || 0,
      amount_obtained: parseFloat(form.amount_obtained) || 0,
      interest_rate: parseFloat(form.interest_rate) || undefined,
      duration_months: parseInt(form.duration_months) || undefined,
      monthly_payment: parseFloat(form.monthly_payment) || undefined,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">Nouveau plan de financement</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Titre *</label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="ex: Prêt BPI pour acquisition bois Serge — 1,1M€" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Type</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => set("type", e.target.value)}>
                {["pret_bancaire","investisseur","subvention","apport_holding","crowdfunding","leasing","autre"].map(v => <option key={v} value={v}>{v.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => set("status", e.target.value)}>
                {["en_preparation","soumis","en_negociation","approuvé","refusé","en_attente"].map(v => <option key={v} value={v}>{v.replace(/_/g," ")}</option>)}
              </select>
            </div>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Montant demandé (€) *</label>
              <Input type="number" value={form.amount_requested} onChange={e => set("amount_requested", e.target.value)} placeholder="1100000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Montant obtenu (€)</label>
              <Input type="number" value={form.amount_obtained} onChange={e => set("amount_obtained", e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Calcul prêt */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Calcul mensualité emprunt</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Taux annuel (%)</label>
                <Input type="number" step="0.01" value={form.interest_rate} onChange={e => set("interest_rate", e.target.value)} placeholder="3.5" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Durée (mois)</label>
                <Input type="number" value={form.duration_months} onChange={e => set("duration_months", e.target.value)} placeholder="120" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Mensualité (€)</label>
                <Input type="number" value={form.monthly_payment} onChange={e => set("monthly_payment", e.target.value)} placeholder="auto" />
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={calcMensualite} className="text-xs">Calculer mensualité</Button>
            {form.monthly_payment > 0 && (
              <p className="text-xs text-primary font-semibold">→ Mensualité : {parseFloat(form.monthly_payment).toLocaleString("fr-FR")} €/mois · Coût total : {(parseFloat(form.monthly_payment) * parseInt(form.duration_months || 1)).toLocaleString("fr-FR")} €</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Institution / Banque</label>
              <Input value={form.contact_institution} onChange={e => set("contact_institution", e.target.value)} placeholder="BPI France, Crédit Agricole..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Contact</label>
              <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Nom du conseiller" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date de soumission</label>
              <Input type="date" value={form.deadline_submission} onChange={e => set("deadline_submission", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date décision</label>
              <Input type="date" value={form.decision_date} onChange={e => set("decision_date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Projet lié</label>
            <Input value={form.project_linked} onChange={e => set("project_linked", e.target.value)} placeholder="ex: Acquisition bois Dordogne" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px] resize-none"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Documents requis, conditions, garanties..."
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.title || !form.amount_requested}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}