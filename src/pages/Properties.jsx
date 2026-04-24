import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, Star, Home, TrendingUp, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColor = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  planning: "bg-primary/10 text-primary border-primary/20",
};

export default function Properties() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", property_type: "appartement", nightly_rate: "", status: "active" });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => base44.entities.Property.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Property.create(d),
    onSuccess: () => { qc.invalidateQueries(["properties"]); setOpen(false); setForm({ name: "", address: "", property_type: "appartement", nightly_rate: "", status: "active" }); },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Propriétés</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Portfolio Expérience Koalas — {properties.length} propriétés</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle propriété</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Type</Label>
                <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["appartement","maison","villa","chalet","studio","loft"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tarif nuitée (€)</Label><Input type="number" value={form.nightly_rate} onChange={e => setForm({ ...form, nightly_rate: e.target.value })} /></div>
              <Button className="w-full" onClick={() => createMutation.mutate({ ...form, nightly_rate: parseFloat(form.nightly_rate) || 0 })}>Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge>
            </div>
            <h3 className="font-semibold text-foreground">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{p.address || "Adresse non renseignée"}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{p.property_type} · {p.bedrooms || 0} ch. · {p.max_guests || 0} pers.</p>
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="w-3 h-3" /></p>
                <p className="text-sm font-semibold">{p.avg_rating?.toFixed(1) || "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /></p>
                <p className="text-sm font-semibold">{p.occupancy_rate ? `${p.occupancy_rate}%` : "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Nuit</p>
                <p className="text-sm font-semibold">{p.nightly_rate ? `${p.nightly_rate}€` : "—"}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune propriété. Ajoutez-en une !</p>
          </div>
        )}
      </div>
    </div>
  );
}