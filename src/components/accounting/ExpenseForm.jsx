import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";

const CATEGORIES = ["salaire", "loyer", "utilities", "fournitures", "transport", "marketing", "maintenance", "assurance", "impots", "emprunt", "travaux", "acquisition", "frais_bancaires", "autre"];
const ENTITIES = ["KOALAS France SARL", "9419 Inc (Holding)", "Vélos Dordogne", "Atelier Cyclo", "SCI Dordogne"];

export default function ExpenseForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    category: "autre",
    amount: "",
    currency: "EUR",
    invoice_number: "",
    supplier: "",
    primary_entity: "KOALAS France SARL",
    payment_status: "pending",
    payment_date: "",
    notes: "",
    is_recurring: false,
    frequency: "",
  });

  const [allocations, setAllocations] = useState([]);
  const [showAllocations, setShowAllocations] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Ajouter allocation
  const addAllocation = () => {
    setAllocations(a => [...a, { entity: form.primary_entity, percentage: 100, reason: "" }]);
    setShowAllocations(true);
  };

  const updateAllocation = (idx, field, val) => {
    setAllocations(a => a.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  };

  const removeAllocation = (idx) => {
    setAllocations(a => a.filter((_, i) => i !== idx));
  };

  const totalPercent = allocations.reduce((s, a) => s + parseFloat(a.percentage || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const expenseData = {
        ...form,
        amount: parseFloat(form.amount),
        is_recurring: form.is_recurring,
      };
      const expense = await base44.entities.Expense.create(expenseData);

      // Créer allocations
      if (allocations.length > 0) {
        for (const alloc of allocations) {
          await base44.entities.ExpenseAllocation.create({
            expense_id: expense.id,
            allocated_entity: alloc.entity,
            allocation_percentage: parseFloat(alloc.percentage),
            allocation_amount: parseFloat(form.amount) * (parseFloat(alloc.percentage) / 100),
            allocation_reason: alloc.reason,
            allocation_date: form.date,
          });
        }
      }

      setSaving(false);
      onSaved();
    } catch (e) {
      setSaving(false);
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-lg">Enregistrer une dépense</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Infos principales */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date *</label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Montant *</label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" className="flex-1" />
                <select className="w-16 rounded-md border border-input bg-background px-2 py-1 text-xs" value={form.currency} onChange={e => set("currency", e.target.value)}>
                  <option>EUR</option>
                  <option>CAD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Catégorie *</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Entité principale</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.primary_entity} onChange={e => set("primary_entity", e.target.value)}>
                {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description *</label>
            <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="ex: Salaire Jennifer - Comptabilité" />
          </div>

          {/* Supplier / Invoice */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fournisseur</label>
              <Input value={form.supplier} onChange={e => set("supplier", e.target.value)} placeholder="ex: EDF, Freelancer XYZ" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">N° Facture / Reçu</label>
              <Input value={form.invoice_number} onChange={e => set("invoice_number", e.target.value)} placeholder="ex: INV-2026-001" />
            </div>
          </div>

          {/* Paiement */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut paiement</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.payment_status} onChange={e => set("payment_status", e.target.value)}>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="partial">Partielle</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date paiement</label>
              <Input type="date" value={form.payment_date} onChange={e => set("payment_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Récurrente ?</label>
              <div className="flex gap-2 items-center h-9">
                <input type="checkbox" checked={form.is_recurring} onChange={e => set("is_recurring", e.target.checked)} className="w-4 h-4" />
                {form.is_recurring && (
                  <select className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs" value={form.frequency} onChange={e => set("frequency", e.target.value)}>
                    <option value="">Fréquence</option>
                    <option value="weekly">Hebdo</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="annual">Annuel</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Détails supplémentaires, références..." />
          </div>

          {/* Dispatch / Allocations */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Dispatch de la dépense (allocation par entité)</p>
              <Button size="sm" variant="outline" onClick={addAllocation}>Ajouter allocation</Button>
            </div>

            {allocations.length > 0 && (
              <div className="space-y-2">
                {allocations.map((a, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <select className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs" value={a.entity} onChange={e => updateAllocation(idx, "entity", e.target.value)}>
                      {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div className="w-20">
                      <Input type="number" min="0" max="100" step="0.1" value={a.percentage} onChange={e => updateAllocation(idx, "percentage", e.target.value)} placeholder="%" className="text-xs h-8" />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-fit">
                      {form.amount ? (parseFloat(form.amount) * parseFloat(a.percentage || 0) / 100).toFixed(2) : "0"} €
                    </span>
                    <button onClick={() => removeAllocation(idx)} className="text-destructive hover:text-destructive/70 text-sm">✕</button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Total dispatch: {totalPercent.toFixed(1)}% {totalPercent !== 100 && totalPercent > 0 && <span className="text-warning">(incomplet)</span>}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-card">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.description || !form.amount || !form.date}>
            {saving ? "Enregistrement..." : "Enregistrer dépense"}
          </Button>
        </div>
      </div>
    </div>
  );
}