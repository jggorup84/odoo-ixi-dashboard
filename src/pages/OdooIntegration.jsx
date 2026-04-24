import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OdooMappingDashboard from "@/components/odoo/OdooMappingDashboard";
import OdooConfigForm from "@/components/odoo/OdooConfigForm";
import { Zap, Settings, Activity } from "lucide-react";

export default function OdooIntegration() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          Synchronisation Odoo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Synchronisation bi-directionnelle en temps réel entre Base44 et Odoo
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" /> Configuration
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Zap className="w-4 h-4" /> Logs avancés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <OdooMappingDashboard />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <div className="space-y-4">
            <OdooConfigForm />
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4">Logs détaillés de synchronisation</h3>
            <p className="text-sm text-muted-foreground">
              Consultez tous les logs de synchronisation, erreurs et tentatives de reconnexion.
            </p>
            {/* Logs détaillés seront affichés ici */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}