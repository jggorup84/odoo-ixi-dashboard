import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Zap } from "lucide-react";
import { motion } from "framer-motion";

const QUICK_COMMANDS = [
  "Quelles sont mes tâches ce matin ?",
  "Passe sur Dordogne en vélo",
  "Montre les urgences",
  "Affiche les blocages",
  "Qui doit payer ?",
  "Résumé Distribution",
  "Prochaine action critique",
];

export default function GabVoiceMode() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    setIsListening(true);
    // Placeholder pour Web Speech API
    setTimeout(() => {
      setIsListening(false);
      setTranscript("Quelles sont mes tâches ce matin ?");
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6 space-y-4">
      {/* Mic Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={startListening}
        className={`w-full h-20 rounded-full flex items-center justify-center text-2xl transition-all ${
          isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {isListening ? (
          <>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <Mic className="w-8 h-8" />
            </motion.div>
            <span className="ml-2">Écoute...</span>
          </>
        ) : (
          <>
            <Mic className="w-8 h-8 mr-2" />
            <span>Parle-moi Gab</span>
          </>
        )}
      </motion.button>

      {/* Transcript */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground mb-1">Compris :</p>
          <p className="font-semibold text-sm text-foreground italic">"{transcript}"</p>
        </motion.div>
      )}

      {/* Quick Commands */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Commandes rapides :</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_COMMANDS.map((cmd, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              onClick={() => setTranscript(cmd)}
              className="text-xs h-8 justify-start"
            >
              <Zap className="w-3 h-3 mr-1" />
              {cmd}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}