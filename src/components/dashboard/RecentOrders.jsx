import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MoreHorizontal, ExternalLink } from "lucide-react";

const orders = [
  { id: "CMD-2024-1847", client: "Société Dupont SA", date: "24 Avr 2026", montant: "12 450 €", statut: "confirmée" },
  { id: "CMD-2024-1846", client: "Tech Solutions SARL", date: "23 Avr 2026", montant: "8 320 €", statut: "en_cours" },
  { id: "CMD-2024-1845", client: "Martin & Associés", date: "23 Avr 2026", montant: "3 190 €", statut: "livrée" },
  { id: "CMD-2024-1844", client: "Global Import SAS", date: "22 Avr 2026", montant: "24 780 €", statut: "confirmée" },
  { id: "CMD-2024-1843", client: "Boutique Élégance", date: "22 Avr 2026", montant: "6 540 €", statut: "en_attente" },
  { id: "CMD-2024-1842", client: "Industries Lorrain", date: "21 Avr 2026", montant: "15 200 €", statut: "livrée" },
  { id: "CMD-2024-1841", client: "Café de la Gare", date: "21 Avr 2026", montant: "1 870 €", statut: "annulée" },
];

const statusConfig = {
  confirmée: { label: "Confirmée", className: "bg-primary/10 text-primary border-primary/20" },
  en_cours: { label: "En cours", className: "bg-amber-50 text-amber-700 border-amber-200" },
  livrée: { label: "Livrée", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  en_attente: { label: "En attente", className: "bg-muted text-muted-foreground border-border" },
  annulée: { label: "Annulée", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function RecentOrders() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-card rounded-xl shadow-sm border border-border"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Commandes récentes</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Dernières commandes enregistrées</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          Voir tout <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                Commande
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                Client
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                Date
              </th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                Montant
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                Statut
              </th>
              <th className="px-6 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const status = statusConfig[order.statut];
              return (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-primary">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-card-foreground">{order.client}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-card-foreground">{order.montant}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium border", status.className)}
                    >
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}