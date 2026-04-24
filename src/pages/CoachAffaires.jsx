import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Send, Loader2, Plus, BrainCircuit, Sparkles, TrendingUp, Users,
  DollarSign, Target, Mic, MicOff, Volume2, VolumeX, Mail, MessageSquare, X, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Analyse financière", prompt: "Analyse la performance financière actuelle de KOALAS et dis-moi où on en est vraiment." },
  { icon: Target, label: "Priorités du mois", prompt: "Quelles sont les 3 priorités stratégiques sur lesquelles Jenn et moi devons nous concentrer ce mois-ci ?" },
  { icon: DollarSign, label: "Optimiser les revenus", prompt: "Comment peut-on optimiser nos revenus de location courte durée et améliorer notre taux d'occupation ?" },
  { icon: Users, label: "Coaching équipe", prompt: "Comment mieux déléguer et structurer nos responsabilités entre Jenn et moi pour scaler l'entreprise ?" },
  { icon: Sparkles, label: "Nouvelles opportunités", prompt: "Quelles opportunités de croissance identifies-tu pour KOALAS dans les 6 prochains mois ?" },
  { icon: BrainCircuit, label: "Diagnostic Odoo", prompt: "Où en sommes-nous avec l'intégration Odoo et quelles améliorations sont prioritaires ?" },
];

// ── Commande vocale (Web Speech API) ────────────────────────────────────────
function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (!supported) { toast.error("Votre navigateur ne supporte pas la reconnaissance vocale."); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    rec.onerror = () => { toast.error("Erreur micro. Vérifiez les permissions."); setListening(false); };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, supported, onResult]);

  return { listening, toggle, supported };
}

// ── Text-to-Speech ───────────────────────────────────────────────────────────
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const speak = useCallback((text) => {
    if (!enabled || !text) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_~\[\]()>]/g, "").replace(/\n+/g, " ").trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "fr-FR";
    utt.rate = 0.95;
    utt.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith("fr"));
    if (frVoice) utt.voice = frVoice;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [enabled]);

  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  return { speaking, enabled, setEnabled, speak, stop };
}

// ── Modal Email ──────────────────────────────────────────────────────────────
function EmailModal({ open, onClose, lastCoachMessage }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Compte-rendu session coach KOALAS");
  const [body, setBody] = useState(lastCoachMessage || "");
  const [sending, setSending] = useState(false);

  useEffect(() => { if (lastCoachMessage) setBody(lastCoachMessage); }, [lastCoachMessage]);

  const send = async () => {
    if (!to) { toast.error("Entrez une adresse email"); return; }
    setSending(true);
    await base44.integrations.Core.SendEmail({ to, subject, body });
    toast.success("Email envoyé !");
    setSending(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="w-4 h-4" /> Envoyer par email</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>À</Label><Input value={to} onChange={e => setTo(e.target.value)} placeholder="email@exemple.com" /></div>
          <div><Label>Objet</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="text-sm" /></div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={send} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Modal SMS ────────────────────────────────────────────────────────────────
function SMSModal({ open, onClose, lastCoachMessage }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [twilioMissing, setTwilioMissing] = useState(false);

  useEffect(() => {
    if (lastCoachMessage) {
      const short = lastCoachMessage.replace(/[#*`_~\[\]()>]/g, "").replace(/\n+/g, " ").trim().substring(0, 300);
      setMessage(short);
    }
  }, [lastCoachMessage]);

  const send = async () => {
    if (!to || !message) { toast.error("Numéro et message requis"); return; }
    setSending(true);
    const res = await base44.functions.invoke("sendSMS", { to, message });
    if (res.data?.setup_required) {
      setTwilioMissing(true);
      setSending(false);
      return;
    }
    if (res.data?.success) { toast.success("SMS envoyé !"); onClose(); }
    else toast.error(res.data?.error || "Erreur envoi SMS");
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Envoyer par SMS</DialogTitle></DialogHeader>
        {twilioMissing ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">⚙️ Configuration Twilio requise</p>
              <p>Pour envoyer des SMS, ajoutez ces secrets dans le tableau de bord :</p>
              <ul className="mt-2 space-y-1 font-mono text-xs">
                <li>• <strong>TWILIO_ACCOUNT_SID</strong></li>
                <li>• <strong>TWILIO_AUTH_TOKEN</strong></li>
                <li>• <strong>TWILIO_FROM_NUMBER</strong> (+1XXXXXXXXXX)</li>
              </ul>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full">Fermer</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div><Label>Numéro (format international)</Label><Input value={to} onChange={e => setTo(e.target.value)} placeholder="+15141234567" /></div>
            <div>
              <Label>Message <span className="text-muted-foreground text-xs">({message.length}/300 car.)</span></Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value.substring(0, 300))} rows={5} className="text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button onClick={send} disabled={sending} className="gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function CoachAffaires() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showSMS, setShowSMS] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  const tts = useTTS();
  const voice = useVoiceInput((transcript) => setInput(prev => prev + transcript));

  const visibleMessages = messages.filter(m => m.role !== "system");
  const lastCoachMsg = [...visibleMessages].reverse().find(m => m.role === "assistant")?.content || "";

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Auto-read last assistant message
  useEffect(() => {
    if (!sending && lastCoachMsg) tts.speak(lastCoachMsg);
  }, [sending]);

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

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 max-w-7xl mx-auto">

      {/* Modals */}
      <EmailModal open={showEmail} onClose={() => setShowEmail(false)} lastCoachMessage={lastCoachMsg} />
      <SMSModal open={showSMS} onClose={() => setShowSMS(false)} lastCoachMessage={lastCoachMsg} />

      {/* Sidebar */}
      <div className="w-60 shrink-0 flex flex-col gap-3">
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl mb-2 shadow-lg">🎯</div>
          <p className="font-bold text-sm text-foreground">Michel Beaumont</p>
          <p className="text-xs text-muted-foreground">Coach d'affaires Senior</p>
          <p className="text-xs text-muted-foreground">25 ans d'expérience</p>
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {["Stratégie","Finances","Leadership"].map(tag => (
              <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-card rounded-xl border border-border p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</p>
          <button onClick={() => setShowEmail(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-left">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span>Envoyer par email</span>
          </button>
          <button onClick={() => setShowSMS(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-left">
            <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Envoyer par SMS</span>
          </button>
          <button
            onClick={() => { tts.setEnabled(!tts.enabled); if (tts.speaking) tts.stop(); }}
            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm text-left",
              tts.enabled ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
            {tts.enabled ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0 text-muted-foreground" />}
            <span>Lecture vocale {tts.enabled ? "ON" : "OFF"}</span>
          </button>
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
                activeConv?.id === conv.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}>
              {conv.metadata?.name || "Session"}
            </button>
          ))}
        </div>
      </div>

      {/* Zone chat principale */}
      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg shrink-0">🎯</div>
          <div className="flex-1">
            <p className="font-bold text-sm">Michel Beaumont — Coach d'affaires</p>
            <p className="text-xs text-muted-foreground">Expert stratégie & croissance · KOALAS / 9419 Inc</p>
          </div>
          <div className="flex items-center gap-3">
            {tts.speaking && (
              <button onClick={tts.stop} className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
                <Volume2 className="w-3.5 h-3.5" /> En lecture...
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Disponible</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {visibleMessages.length === 0 && !sending && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mx-auto mb-3">🎯</div>
                <h3 className="font-bold text-lg text-foreground">Bonjour Jenn & vous !</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Je suis Michel, votre coach dédié. Parlez-moi directement avec le micro 🎤, tapez votre question, et je peux vous répondre à voix haute, par email ou SMS.
                </p>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-primary" /> Vocal</span>
                  <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-primary" /> Lecture</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> Email</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-primary" /> SMS</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Commencer par...</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button key={qp.label} onClick={() => sendMessage(qp.prompt)}
                      disabled={!activeConv}
                      className="flex items-center gap-2.5 p-3 bg-muted/50 hover:bg-muted rounded-xl text-left transition-all hover:shadow-sm border border-transparent hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <qp.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{qp.label}</span>
                    </button>
                  ))}
                </div>
                {!activeConv && <p className="text-xs text-muted-foreground text-center mt-3">👆 Créez une session pour commencer</p>}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {visibleMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm">🎯</div>
                )}
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background border border-border rounded-tl-sm")}>
                  {msg.role === "user" ? (
                    <p className="leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>
                      <ReactMarkdown
                        className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 text-foreground">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 text-foreground">{children}</ol>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          p: ({ children }) => <p className="leading-relaxed my-1 text-foreground">{children}</p>,
                        }}
                      >{msg.content}</ReactMarkdown>
                      {/* Actions sur le message coach */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                        <button onClick={() => tts.speak(msg.content)} title="Lire à voix haute"
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setShowEmail(true); }} title="Envoyer par email"
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setShowSMS(true); }} title="Envoyer par SMS"
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-500">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm shrink-0 mt-0.5">👤</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sending && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm shrink-0">🎯</div>
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
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
            {/* Bouton micro */}
            <button
              onClick={voice.toggle}
              title={voice.listening ? "Arrêter l'écoute" : "Parler à Michel"}
              className={cn(
                "p-2.5 rounded-lg border transition-all shrink-0",
                voice.listening
                  ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
                  : "bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary"
              )}
            >
              {voice.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={voice.listening ? "🎤 Parlez maintenant..." : activeConv ? "Posez votre question à Michel..." : "Créez une session pour commencer..."}
              disabled={!activeConv || sending}
              className={cn("flex-1", voice.listening && "border-destructive focus-visible:ring-destructive/30")}
            />
            <Button onClick={() => sendMessage()} disabled={!input.trim() || !activeConv || sending} className="gap-2 px-4">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {voice.listening ? "🔴 Écoute en cours — parlez clairement en français" : "🎤 Micro · 🔊 Lecture vocale · ✉️ Email · 💬 SMS disponibles"}
            </p>
            {tts.speaking && (
              <button onClick={tts.stop} className="text-xs text-primary hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Arrêter lecture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}