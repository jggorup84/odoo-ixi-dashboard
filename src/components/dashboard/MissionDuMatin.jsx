import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, DollarSign, Users, CheckCircle2, Eye, Zap } from "lucide-react";
import { motion } from "framer-motion";
import CompanyBranchSelector from "./CompanyBranchSelector";
import GabVoiceMode from "./GabVoiceMode";
import ProjectCard from "./ProjectCard";
import IntercompanyFlow from "./IntercompanyFlow";

export default function MissionDuMatin() {
  const [activeCompany, setActiveCompany] = useState("SARL Les Entreprises Koalas France");
  const [activeBranch, setActiveBranch] = useState("Dordogne en vélo");
  const [mode, setMode] = useState("gab"); // gab or jenn

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", activeCompany, activeBranch],
    queryFn: () => base44.entities.Task.list("-total_score", 100),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => base44.entities.Branch.list(),
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const companyMatch = !activeCompany || t.entity === activeCompany;
      const branchMatch = !activeBranch || t.project === activeBranch;
      return companyMatch && branchMatch;
    });
  }, [tasks, activeCompany, activeBranch]);

  const topPriorities = useMemo(() => {
    return filteredTasks
      .filter(t => ["P0", "P1"].includes(t.priority))
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5);
  }, [filteredTasks]);

  const blockedTasks = filteredTasks.filter(t => t.status === "Bloqué");
  const urgentTasks = filteredTasks.filter(t => t.urgence_score >= 4);
  const gabTasks = filteredTasks.filter(t => t.assigned_to === "Gab");
  const jennTasks = filteredTasks.filter(t => t.assigned_to === "Jenn" || t.status === "En attente Jenn");

  const totalRevenue = filteredTasks.reduce((sum, t) => sum + (t.expected_revenue || 0), 0);

  const activeBranchData = branches.find(b => b.name === activeBranch);

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4"
      >
        <p className="text-sm text-muted-foreground">Mission du matin</p>
        <h1 className="text-3xl font-black text-foreground mt-1">
          Bonjour {mode === "gab" ? "Gab" : "Jenn"} 🎯
        </h1>
        <div className="mt-3 space-y-1">
          <p className="text-sm">
            <span className="font-semibold">Société active :</span> {activeCompany}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Branche :</span> {activeBranch}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Focus :</span> Implantation Base44 ↔ Odoo
          </p>
        </div>
      </motion.div>

      {/* Company/Branch Selector */}
      <CompanyBranchSelector
        onCompanyChange={setActiveCompany}
        onBranchChange={setActiveBranch}
        defaultCompany={activeCompany}
      />

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          onClick={() => setMode("gab")}
          variant={mode === "gab" ? "default" : "outline"}
          className="flex-1"
        >
          🎙️ Mode Gab
        </Button>
        <Button
          onClick={() => setMode("jenn")}
          variant={mode === "jenn" ? "default" : "outline"}
          className="flex-1"
        >
          📋 Mode Jenn
        </Button>
      </div>

      {/* Gab Mode */}
      {mode === "gab" && (
        <div className="space-y-4">
          <GabVoiceMode />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-3"
            >
              <p className="text-xs text-muted-foreground">Top priorités</p>
              <p className="text-3xl font-bold text-primary">{topPriorities.length}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-3"
            >
              <p className="text-xs text-muted-foreground">Blocages</p>
              <p className={`text-3xl font-bold ${blockedTasks.length > 0 ? "text-red-600" : "text-green-600"}`}>
                {blockedTasks.length}
              </p>
            </motion.div>
          </div>

          {/* Top 5 Priorities */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Top 5 priorités
            </h3>
            {topPriorities.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-2 bg-muted/50 rounded text-xs border-l-2 border-primary"
              >
                <p className="font-semibold">{task.title}</p>
                <p className="text-muted-foreground text-xs">Score: {task.total_score} • {task.status}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Jenn Mode */}
      {mode === "jenn" && (
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="text-xs">Mes tâches</TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">À valider</TabsTrigger>
            <TabsTrigger value="projets" className="text-xs">Projets</TabsTrigger>
            <TabsTrigger value="factures" className="text-xs">Factures</TabsTrigger>
          </TabsList>

          {/* My Tasks */}
          <TabsContent value="tasks" className="mt-4 space-y-2">
            {jennTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune tâche actuellement</p>
            ) : (
              jennTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/50"
                >
                  <input type="checkbox" className="w-4 h-4 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                    {task.legal_risk && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ {task.legal_risk}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                    {task.priority}
                  </span>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Validations */}
          <TabsContent value="validation" className="mt-4 space-y-2">
            {jennTasks.filter(t => t.status === "En attente Jenn").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune validation requise</p>
            ) : (
              jennTasks
                .filter(t => t.status === "En attente Jenn")
                .map((task) => (
                  <div key={task.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-semibold text-sm">✓ {task.title}</p>
                    <Button size="sm" className="mt-2" variant="outline">
                      Valider
                    </Button>
                  </div>
                ))
            )}
          </TabsContent>

          {/* Projets */}
          <TabsContent value="projets" className="mt-4">
            <IntercompanyFlow />
          </TabsContent>

          {/* Factures */}
          <TabsContent value="factures" className="mt-4 space-y-2">
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-sm font-semibold">Montant total en facturation</p>
              <p className="text-2xl font-bold text-primary mt-1">{totalRevenue}€</p>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Projects by Branch */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Projets de {activeBranch}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTasks
            .reduce((projects, task) => {
              const existing = projects.find(p => p.name === task.project);
              if (existing) {
                existing.tasks.push(task);
              } else {
                projects.push({ name: task.project, tasks: [task] });
              }
              return projects;
            }, [])
            .map((project) => (
              <ProjectCard
                key={project.name}
                project={{
                  name: project.name,
                  entity: activeCompany,
                  status: project.tasks[0]?.status || "En cours",
                  priority: project.tasks[0]?.priority || "P2",
                  assigned_to: project.tasks[0]?.assigned_to || "TBD",
                  next_action: project.tasks[0]?.next_action,
                }}
                tasksCount={project.tasks.length}
                blockedCount={project.tasks.filter(t => t.status === "Bloqué").length}
                totalRevenue={project.tasks.reduce((sum, t) => sum + (t.expected_revenue || 0), 0)}
                needsValidation={project.tasks.some(t => t.status === "En attente Jenn")}
              />
            ))}
        </div>
      </div>
    </div>
  );
}