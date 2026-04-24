import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Star, Heart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const expColor = {
  romantique: "bg-pink-50 text-pink-700 border-pink-200",
  famille: "bg-primary/10 text-primary border-primary/20",
  aventure: "bg-emerald-50 text-emerald-700 border-emerald-200",
  détente: "bg-purple-50 text-purple-700 border-purple-200",
  affaires: "bg-muted text-muted-foreground border-border",
  groupe: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function GuestExperiences() {
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["guest_experiences"],
    queryFn: () => base44.entities.GuestExperience.list("-created_date"),
  });

  const avgScore = experiences.length > 0
    ? (experiences.reduce((s, e) => s + (e.satisfaction_score || 0), 0) / experiences.filter(e => e.satisfaction_score).length).toFixed(1)
    : "—";

  const wouldReturn = experiences.filter(e => e.would_return).length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Expériences invités</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{experiences.length} expériences · Satisfaction moy. {avgScore}/5</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Score moyen", value: `${avgScore}/5`, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Reviendront", value: wouldReturn, icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
          { label: "Total expériences", value: experiences.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">Chargement...</div>
        ) : experiences.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune expérience enregistrée</p>
          </div>
        ) : experiences.map((exp, i) => (
          <motion.div key={exp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{exp.guest_name}</p>
                <p className="text-xs text-muted-foreground">{exp.property_name}</p>
              </div>
              {exp.satisfaction_score && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{exp.satisfaction_score}</span>
                </div>
              )}
            </div>
            {exp.experience_type && (
              <Badge variant="outline" className={cn("text-xs mb-2", expColor[exp.experience_type])}>{exp.experience_type}</Badge>
            )}
            {exp.review_text && <p className="text-xs text-muted-foreground line-clamp-3 italic">"{exp.review_text}"</p>}
            {exp.would_return && <p className="text-xs text-emerald-600 mt-2 font-medium">✓ Reviendrait</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}