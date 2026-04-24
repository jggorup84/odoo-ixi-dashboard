import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, DollarSign, CheckCircle2, Circle, Zap, Plus, X, ChevronDown, ChevronUp, Target, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { differenceInDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import ProjectForm from "@/components/crisis/ProjectForm";
import FinancingForm from "@/components/crisis/FinancingForm";
import CashFlowAlert from "@/components/crisis/CashFlowAlert";

const priorityColor = {
  critique: "bg-red-500 text-white",
  haute: "bg-orange-500 text-white",
  moyenne: "bg-amber-400 text-foreground",
  basse: "bg-slate-300 text-foreground"
};

const statusColor = {
  "non_démarré": "bg-slate-200 text-slate-700",
  "en_cours": "bg-blue-100 text-blue-700",
  "bloqué": "bg-red-100 text-red-700",
  "terminé": "bg-green-100 text-green-700",
  "annulé": "bg-gray-100 text-gray-500"
};

function DaysLeftBadge({ deadline }) {
  const days = differenceInDays(parseISO(deadline), new Date());
  const color = days <= 3 ? "bg-red-600 text-white" : days <= 7 ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {days <= 0 ? "DÉPASSÉ" : `J-${days}`}
    </span>
  );
}

export default function CrisisCommand() {
  const qc = useQueryClient();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showFinancingForm, setShowFinancingForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-deadline", 50)
  });

  const { data: financings = [] } = useQuery({
    queryKey: ["financings"],
    queryFn: () => base44.entities.FinancingPlan.list("-created_date", 50)
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] })
  });

  const deleteProject = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] })
  });

  // Stats globales
  const totalBudgetNeeded = projects.reduce((s, p) => s + (p.budget_needed || 0), 0);
  const totalBudgetAvail = projects.reduce((s, p) => s + (p.budget_available || 0), 0);
  const totalFinancingAsked = financings.reduce((s, f) => s + (f.amount_requested || 0), 0);
  const totalFinancingObtained = financings.reduce((s, f) => s + (f.amount_obtained || 0), 0);
  const criticalProjects = projects.filter(p => p.priority === "critique" || differenceInDays(parseISO(p.deadline || new Date().toISOString()), new Date()) <= 7);
  const blockedProjects = projects.filter(p => p.status === "bloqué");
  const gapFinancement = totalBudgetNeeded - totalBudgetAvail - totalFinancingObtained;

  const activeFinancings = financings.filter(f => f.status !== "refusé" && f.status !== "annulé");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Commandement de Crise — KOALAS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pilotage temps réel · Holding sous pression · Dordogne J-10</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditProject(null); setShowProjectForm(true); }} size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Projet
          </Button>
          <Button onClick={() => setShowFinancingForm(true)} size="sm" variant="outline" className="gap-1">
            <DollarSign className="w-4 h-4" /> Financement
          </Button>
        </div>
      </div>

      {/* Alerte Cash */}
      <CashFlowAlert
        gapFinancement={gapFinancement}
        totalBudgetNeeded={totalBudgetNeeded}
        totalBudgetAvail={totalBudgetAvail}
        totalFinancingObtained={totalFinancingObtained}
        blockedCount={blockedProjects.length}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projets critiques (≤7j)", value: criticalProjects.length, icon: Zap, color: "text-red-500", bg: "bg-red-50" },
          { label: "Projets bloqués", value: blockedProjects.length, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Financement demandé", value: `${(totalFinancingAsked/1000).toFixed(0)}k€`, icon: DollarSign, color: "text-primary", bg: "bg-primary/5" },
          { label: "Financement obtenu", value: `${(totalFinancingObtained/1000).toFixed(0)}k€`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((k) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${k.bg} rounded-xl p-4 border border-border`}>
            <div className="flex items-center gap-2 mb-1">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Projets critiques */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Projets & Deadlines</h2>
          <span className="text-xs text-muted-foreground">{projects.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {projects.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun projet — cliquez sur "+ Projet" pour commencer</p>
          )}
          {projects.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{p.name}</span>
                    <Badge className={`text-xs px-1.5 py-0 ${priorityColor[p.priority] || ""}`}>{p.priority}</Badge>
                    <Badge className={`text-xs px-1.5 py-0 ${statusColor[p.status] || ""}`}>{p.status?.replace("_", " ")}</Badge>
                    {p.deadline && <DaysLeftBadge deadline={p.deadline} />}
                  </div>
                  {p.entity_linked && <p className="text-xs text-muted-foreground mt-0.5">🏢 {p.entity_linked}</p>}
                  {p.next_action && <p className="text-xs text-primary mt-1 font-medium">→ {p.next_action}</p>}
                  {p.blockers && <p className="text-xs text-red-500 mt-0.5">⚠ {p.blockers}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {p.budget_needed > 0 && (
                    <span className="text-xs font-semibold text-foreground">{p.budget_needed.toLocaleString("fr-FR")} €</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditProject(p); setShowProjectForm(true); }}
                      className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 transition"
                    >Éditer</button>
                    {p.status !== "terminé" && (
                      <button
                        onClick={() => updateProject.mutate({ id: p.id, data: { status: "terminé", completion_percent: 100 } })}
                        className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
                      >✓</button>
                    )}
                  </div>
                </div>
              </div>
              {/* Barre de progression */}
              {p.completion_percent !== undefined && (
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${p.completion_percent}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Financements */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Plans de Financement</h2>
          <span className="text-xs text-muted-foreground">{activeFinancings.length} actifs</span>
        </div>
        <div className="divide-y divide-border">
          {financings.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun plan — cliquez sur "+ Financement"</p>
          )}
          {financings.map((f) => (
            <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.contact_institution} {f.contact_name && `· ${f.contact_name}`}</p>
                  {f.deadline_submission && (
                    <p className="text-xs text-orange-600 mt-0.5">📅 Soumission: {format(parseISO(f.deadline_submission), "dd MMM yyyy", { locale: fr })}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-foreground">{f.amount_requested?.toLocaleString("fr-FR")} €</p>
                  {f.amount_obtained > 0 && <p className="text-xs text-emerald-600 font-semibold">✓ {f.amount_obtained?.toLocaleString("fr-FR")} € obtenu</p>}
                  <Badge className={`text-xs mt-1 ${f.status === "approuvé" ? "bg-green-100 text-green-700" : f.status === "refusé" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {f.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          project={editProject}
          onClose={() => { setShowProjectForm(false); setEditProject(null); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["projects"] }); setShowProjectForm(false); setEditProject(null); }}
        />
      )}
      {showFinancingForm && (
        <FinancingForm
          onClose={() => setShowFinancingForm(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["financings"] }); setShowFinancingForm(false); }}
        />
      )}
    </div>
  );
}