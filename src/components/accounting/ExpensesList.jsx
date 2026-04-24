import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Download, Filter } from "lucide-react";

const CATEGORY_COLORS = {
  salaire: "bg-blue-100 text-blue-700",
  loyer: "bg-purple-100 text-purple-700",
  utilities: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-orange-100 text-orange-700",
  travaux: "bg-red-100 text-red-700",
  autre: "bg-gray-100 text-gray-700",
};

export default function ExpensesList() {
  const [filter, setFilter] = useState({ category: "", entity: "", month: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-date", 500),
    refetchInterval: 30000,
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filter.category && e.category !== filter.category) return false;
      if (filter.entity && e.primary_entity !== filter.entity) return false;
      if (searchTerm && !e.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [expenses, filter, searchTerm]);

  const totalAmount = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-8 text-sm" />
        </div>
        <select className="rounded-md border border-input bg-background px-3 py-1 text-xs h-8" value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">Toutes catégories</option>
          <option value="salaire">Salaire</option>
          <option value="loyer">Loyer</option>
          <option value="utilities">Utilities</option>
          <option value="maintenance">Maintenance</option>
          <option value="travaux">Travaux</option>
          <option value="autre">Autre</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-1 text-xs h-8" value={filter.entity} onChange={e => setFilter(f => ({ ...f, entity: e.target.value }))}>
          <option value="">Toutes entités</option>
          <option value="KOALAS France SARL">KOALAS France</option>
          <option value="9419 Inc (Holding)">9419 Inc</option>
          <option value="Vélos Dordogne">Vélos Dordogne</option>
        </select>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground">Total dépenses filtrées</p>
          <p className="text-2xl font-bold text-foreground">{totalAmount.toLocaleString("fr-FR")} €</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredExpenses.map((e, idx) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.autre}`}>{e.category}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("fr-FR")}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Entité: <strong>{e.primary_entity}</strong> {e.supplier && `· Fournisseur: ${e.supplier}`}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{e.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {e.currency}</p>
                <p className={`text-xs font-semibold ${e.payment_status === "paid" ? "text-success" : "text-warning"}`}>{e.payment_status === "paid" ? "✓ Payée" : "⏳ En attente"}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}