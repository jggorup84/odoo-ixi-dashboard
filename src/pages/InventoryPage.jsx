import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAlert, setFilterAlert] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => base44.entities.Inventory.list("-created_date"),
  });

  const filtered = items.filter(i => {
    const c = filterCategory === "all" || i.category === filterCategory;
    const a = filterAlert === "all" || (filterAlert === "reorder" && i.reorder_needed);
    return c && a;
  });

  const alerts = items.filter(i => i.reorder_needed).length;

  const getStockLevel = (item) => {
    if (!item.current_quantity || !item.optimal_quantity) return 0;
    return Math.min(100, Math.round((item.current_quantity / item.optimal_quantity) * 100));
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventaire</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{filtered.length} articles {alerts > 0 && `· ${alerts} alertes`}</p>
        </div>
      </div>

      {alerts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{alerts} article(s) à réapprovisionner</p>
        </div>
      )}

      <div className="flex gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {["linge","produits_ménage","toilette","cuisine","accueil","salle_de_bain","entretien","consommables"].map(c => (
              <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAlert} onValueChange={setFilterAlert}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Alerte" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="reorder">À réapprovisionner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun article trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Article</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden sm:table-cell">Propriété</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Stock</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden md:table-cell">Valeur</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item, i) => {
                const level = getStockLevel(item);
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.category?.replace(/_/g, " ")}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="text-sm text-muted-foreground">{item.property_name || "Général"}</p>
                    </td>
                    <td className="px-5 py-3 w-48">
                      <div className="flex items-center gap-2">
                        <Progress value={level} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-16 shrink-0">
                          {item.current_quantity || 0} / {item.optimal_quantity || 0} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right hidden md:table-cell">
                      <p className="text-sm font-medium">{item.total_value ? `${item.total_value.toFixed(2)} €` : "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      {item.reorder_needed && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 gap-1">
                          <TrendingDown className="w-3 h-3" /> Reorder
                        </Badge>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}