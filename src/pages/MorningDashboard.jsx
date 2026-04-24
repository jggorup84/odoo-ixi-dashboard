import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MorningCockpit from "@/components/dashboard/MorningCockpit";
import { Zap, Users } from "lucide-react";

export default function MorningDashboard() {
  const [activeTab, setActiveTab] = useState("gab");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-8 h-8 text-primary" />
            Cockpit du matin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Orchestration Gab & Jenn — Système KLIF</p>
        </div>
        <Button variant="outline">🔄 Actualiser</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="gab" className="gap-2">
            <span>🎯</span> Gab
          </TabsTrigger>
          <TabsTrigger value="jenn" className="gap-2">
            <span>📋</span> Jenn
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <span>👥</span> Vue globale
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gab" className="mt-4">
          <MorningCockpit userRole="gab" />
        </TabsContent>

        <TabsContent value="jenn" className="mt-4">
          <MorningCockpit userRole="jenn" />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Vue Gab</h3>
              <MorningCockpit userRole="gab" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Vue Jenn</h3>
              <MorningCockpit userRole="jenn" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}