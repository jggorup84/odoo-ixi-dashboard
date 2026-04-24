import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function ChatOdoo() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.agents.listConversations({ agent_name: "odoo_assistant" }).then(convs => {
      setConversations(convs || []);
      if (convs?.length > 0) loadConversation(convs[0]);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async (conv) => {
    setActiveConv(conv);
    const full = await base44.agents.getConversation(conv.id);
    setMessages(full.messages || []);
    base44.agents.subscribeToConversation(conv.id, (data) => setMessages(data.messages || []));
  };

  const newConversation = async () => {
    const conv = await base44.agents.createConversation({ agent_name: "odoo_assistant", metadata: { name: `Chat ${new Date().toLocaleTimeString("fr-FR")}` } });
    setConversations(prev => [conv, ...prev]);
    loadConversation(conv);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    const text = input;
    setInput("");
    await base44.agents.addMessage(activeConv, { role: "user", content: text });
    setSending(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 max-w-6xl mx-auto">
      {/* Sidebar conversations */}
      <div className="w-56 shrink-0 flex flex-col gap-2">
        <Button onClick={newConversation} size="sm" className="gap-2 w-full"><Plus className="w-4 h-4" /> Nouveau chat</Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => loadConversation(conv)}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                activeConv?.id === conv.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}>
              {conv.metadata?.name || "Chat"}
            </button>
          ))}
        </div>
      </div>

      {/* Zone chat */}
      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Assistant Odoo IXI</p>
            <p className="text-xs text-muted-foreground">Expert ERP & Location courte durée</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Bonjour ! Je suis votre assistant Odoo IXI</p>
              <p className="text-xs mt-1">Posez-moi une question sur vos données, vos opérations ou votre ERP</p>
            </div>
          )}
          <AnimatePresence>
            {messages.filter(m => m.role !== "system").map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sending && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Posez votre question..."
            disabled={!activeConv || sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || !activeConv || sending} size="icon">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}