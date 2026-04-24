import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Plus, Trash2, BrainCircuit, Sparkles, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Analyse financière", prompt: "Analyse la performance financière actuelle de KOALAS et dis-moi où on en est vraiment." },
  { icon: Target, label: "Priorités du mois", prompt: "Quelles sont les 3 priorités stratégiques sur lesquelles Jenn et moi devons nous concentrer ce mois-ci ?" },
  { icon: DollarSign, label: "Optimiser les revenus", prompt: "Comment peut-on optimiser nos revenus de location courte durée et améliorer notre taux d'occupation ?" },
  { icon: Users, label: "Coaching équipe", prompt: "Comment mieux déléguer et structurer nos responsabilités entre Jenn et moi pour scaler l'entreprise ?" },
  { icon: Sparkles, label: "Nouvelles opportunités", prompt: "Quelles opportunités de croissance identifies-tu pour KOALAS dans les 6 prochains mois ?" },
  { icon: BrainCircuit, label: "Diagnostic Odoo", prompt: "Où en sommes-nous avec l'intégration Odoo et quelles améliorations sont prioritaires ?" },
];

export default function CoachAffaires() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    const convs = await base44.agents.listConversations({ agent_name: "business_coach" });
    setConversations(convs || []);
    if (convs?.length > 0) await openConversation(convs[0]);
    setLoadingConvs(false);
  };

  const openConversation = async (conv) => {
    if (unsubRef.current) unsubRef.current();
    setActiveConv(conv);
    const full = await base44.agents.getConversation(conv.id);
    setMessages(full.messages || []);
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
  };

  const newConversation = async () => {
    const now = format(new Date(), "d MMM yyyy 'à' HH:mm", { locale: fr });
    const conv = await base44.agents.createConversation({
      agent_name: "business_coach",
      metadata: { name: `Session du ${now}` },
    });
    setConversations(prev => [conv, ...prev]);
    await openConversation(conv);
    setMessages([]);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !activeConv || sending) return;
    setInput("");
    setSending(true);
    await base44.agents.addMessage(activeConv, { role: "user", content: msg });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const visibleMessages = messages.filter(m => m.role !== "system");

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 max-w-7xl mx-auto">

      {/* Sidebar */}
      <div className="w-60 shrink-0 flex flex-col gap-3">
        {/* Profil coach */}
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl mb-2 shadow-lg">
            🎯
          </div>
          <p className="font-bold text-sm text-foreground">Michel Beaumont</p>
          <p className="text-xs text-muted-foreground">Coach d'affaires Senior</p>
          <p className="text-xs text-muted-foreground">25 ans d'expérience</p>
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {["Stratégie","Finances","Leadership"].map(tag => (
              <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        <Button onClick={newConversation} className="gap-2 w-full" size="sm">
          <Plus className="w-4 h-4" /> Nouvelle session
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Sessions</p>
          {loadingConvs ? (
            <div className="text-xs text-muted-foreground px-2">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2">Aucune session</div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => openConversation(conv)}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate",
                activeConv?.id === conv.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground")}>
              {conv.metadata?.name || "Session"}
            </button>
          ))}
        </div>
      </div>

      {/* Zone chat principale */}
      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg shrink-0">
            🎯
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Michel Beaumont — Coach d'affaires</p>
            <p className="text-xs text-muted-foreground">Expert stratégie & croissance · KOALAS / 9419 Inc</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Disponible</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Écran vide */}
          {visibleMessages.length === 0 && !sending && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mx-auto mb-3">
                  🎯
                </div>
                <h3 className="font-bold text-lg text-foreground">Bonjour Jenn & vous !</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Je suis Michel, votre coach d'affaires dédié. Je connais KOALAS de fond en comble et je suis ici pour vous aider à prendre les meilleures décisions.
                </p>
              </div>

              {/* Quick prompts */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Commencer par...</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button key={qp.label} onClick={() => sendMessage(qp.prompt)}
                      disabled={!activeConv}
                      className="flex items-center gap-2.5 p-3 bg-muted/50 hover:bg-muted rounded-xl text-left transition-all hover:shadow-sm group border border-transparent hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <qp.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{qp.label}</span>
                    </button>
                  ))}
                </div>
                {!activeConv && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    👆 Créez une session pour commencer
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {visibleMessages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>

                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm">
                    🎯
                  </div>
                )}

                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background border border-border rounded-tl-sm")}>
                  {msg.role === "user" ? (
                    <p className="leading-relaxed">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
                      components={{
                        h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1">{children}</ol>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        p: ({ children }) => <p className="leading-relaxed my-1">{children}</p>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    👤
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicateur de frappe */}
          {sending && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm shrink-0">
                🎯
              </div>
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Michel réfléchit...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={activeConv ? "Posez votre question à Michel..." : "Créez une session pour commencer..."}
              disabled={!activeConv || sending}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !activeConv || sending}
              className="gap-2 px-4"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Michel a accès aux données réelles de KOALAS pour vous donner des conseils personnalisés
          </p>
        </div>
      </div>
    </div>
  );
}