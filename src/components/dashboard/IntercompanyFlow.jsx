import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Box, Wrench, Zap, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function IntercompanyFlow() {
  const flows = [
    {
      name: "Dordogne en vélo",
      steps: [
        { entity: "Distribution Koalas", role: "Possède", icon: Box },
        { entity: "Atelier Cyclo", role: "Prépare", icon: Wrench },
        { entity: "Dordogne en vélo", role: "Exploite", icon: Zap },
        { entity: "Expérience", role: "Vend", icon: DollarSign },
      ],
      pending_billing: 3,
      assets_in_france: 12,
    },
    {
      name: "Noyer & Co",
      steps: [
        { entity: "Distribution Koalas", role: "Achète", icon: Box },
        { entity: "Noyer & Co", role: "Produit", icon: Wrench },
        { entity: "Gorup Signature", role: "Vend", icon: DollarSign },
      ],
      pending_billing: 1,
      assets_in_france: 5,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Flux inter-sociétés</h3>
        <Badge variant="outline">Facturation centralisée</Badge>
      </div>

      {flows.map((flow, flowIdx) => (
        <motion.div
          key={flowIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: flowIdx * 0.1 }}
        >
          <Card className="p-4">
            <p className="font-bold text-sm mb-3">{flow.name}</p>

            {/* Flow Steps */}
            <div className="flex items-center justify-between mb-4 text-xs">
              {flow.steps.map((step, stepIdx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={stepIdx}
                    className="flex flex-col items-center flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: stepIdx * 0.1 }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-1">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-semibold text-center">{step.role}</p>
                    <p className="text-muted-foreground text-center text-xs">{step.entity}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Factures en attente</p>
                <p className="font-bold text-sm text-warning">{flow.pending_billing}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actifs en France</p>
                <p className="font-bold text-sm text-primary">{flow.assets_in_france}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}