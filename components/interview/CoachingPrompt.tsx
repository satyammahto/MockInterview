import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

interface CoachingPromptProps {
  tip: string | null;
  durationMs?: number;
}

export function CoachingPrompt({ tip, durationMs = 5000 }: CoachingPromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (tip) {
      const showTimer = setTimeout(() => setIsVisible(true), 10);
      const hideTimer = setTimeout(() => setIsVisible(false), durationMs);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [tip, durationMs]);

  return (
    <AnimatePresence>
      {isVisible && tip && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 right-6 w-80 bg-surface border border-accent/30 shadow-[0_8px_30px_rgba(78,255,163,0.15)] rounded-2xl p-4 z-50 overflow-hidden"
        >
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
          
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-accent" />
            </div>
            
            <div className="flex-1 pt-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-1">
                AI Coaching Tip
              </h4>
              <p className="text-sm leading-relaxed text-foreground">
                {tip}
              </p>
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:bg-white/10 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar timer */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: durationMs / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-accent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
