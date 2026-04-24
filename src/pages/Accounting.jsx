import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseForm from "@/components/accounting/ExpenseForm";
import ExpensesList from "@/components/accounting/ExpensesList";
import ForecastBuilder from "@/components/accounting/ForecastBuilder";

export default function Accounting() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Comptabilité & Finances
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Saisie dépenses, dispatch par entité, prévision 3 ans pour prêt reno 50K€</p>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle dépense
        </Button>
      </div>

      <Tabs defaultValue="depenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="depenses">Dépenses</TabsTrigger>
          <TabsTrigger value="prévision">Prévisions 3 ans</TabsTrigger>
          <TabsTrigger value="allocations">Dispatch</TabsTrigger>
        </TabsList>

        <TabsContent value="depenses" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Saisissez toutes les factures, frais et dépenses ici. Jennifer peut entrer les justificatifs et le système dispatche automatiquement les montants aux 5 entités.
            </p>
            <ExpensesList />
          </div>
        </TabsContent>

        <TabsContent value="prévision" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Construisez la prévision 3 ans (2026-2028) pour présentation aux banques. Cliquez sur les mois pour éditer revenus et charges. Ce document sera validé par votre comptable et servira de base pour le prêt reno 50K€.
            </p>
            <ForecastBuilder />
          </div>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Vue du dispatch des dépenses par entité. Chaque dépense peut être split entre plusieurs entités avec un pourcentage d'allocation.
            </p>
            {/* À implémenter: liste des allocations */}
            <div className="text-center py-8 text-muted-foreground">
              Les allocations apparaîtront ici après saisie des dépenses.
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} onSaved={() => setShowExpenseForm(false)} />}
    </div>
  );
}