import { motion } from "framer-motion";

interface AIAvatarProps {
  isSpeaking: boolean;
  isProcessing?: boolean;
}

export function AIAvatar({ isSpeaking, isProcessing = false }: AIAvatarProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-4">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer glowing rings */}
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }
              : isProcessing
              ? { rotate: 360, scale: [1, 1.05, 1] }
              : { scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }
          }
          transition={{
            duration: isSpeaking ? 1.5 : isProcessing ? 3 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full border border-accent/30"
          style={{
            background: isProcessing
              ? "radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(78,255,163,0.15) 0%, transparent 70%)",
          }}
        />
        
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }
              : { scale: 1, opacity: 0.1 }
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute inset-[-20%] rounded-full bg-accent"
        />

        {/* Core Avatar */}
        <div
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(78,255,163,0.2)]"
          style={{
            background: "linear-gradient(135deg, #1A2235, #0E1220)",
            border: `2px solid ${isProcessing ? '#7B61FF' : '#4EFFA3'}`,
          }}
        >
          <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {isProcessing ? "🧠" : "🤖"}
          </span>
        </div>
      </div>
      
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
        {isSpeaking ? (
          <span className="text-accent animate-pulse">AI is Speaking...</span>
        ) : isProcessing ? (
          <span className="text-[#7B61FF] animate-pulse">Analyzing...</span>
        ) : (
          "AI Interviewer"
        )}
      </p>
    </div>
  );
}
