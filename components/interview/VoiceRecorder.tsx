import { Mic, Square } from "lucide-react";

interface VoiceRecorderProps {
  isRecording: boolean;
  audioLevel: number; // 0 to 1
  onToggle: () => void;
  disabled?: boolean;
}

const NUM_BARS = 24;

export function VoiceRecorder({ isRecording, audioLevel, onToggle, disabled = false }: VoiceRecorderProps) {
  // Generate faux-random heights that scale with audioLevel
  const getBarHeight = (index: number) => {
    if (!isRecording) return 4;
    // Base wave pattern + audioLevel scaling
    const baseHeight = Math.sin((index / NUM_BARS) * Math.PI) * 100;
    const noise = (Math.random() - 0.5) * 20;
    // Scale strongly by audio level (which is 0-1)
    const activeHeight = Math.max(4, (baseHeight + noise) * (audioLevel * 1.5 + 0.2));
    return Math.min(60, activeHeight);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end justify-center gap-1 h-[60px] w-full max-w-[300px] overflow-hidden">
        {Array.from({ length: NUM_BARS }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-75"
            style={{
              height: `${getBarHeight(i)}px`,
              background: isRecording ? '#4EFFA3' : '#1E2535',
              opacity: isRecording ? 0.8 + Math.random() * 0.2 : 0.4,
            }}
          />
        ))}
      </div>

      <button
        onClick={onToggle}
        disabled={disabled}
        title={isRecording ? "Stop Recording" : "Start Recording"}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group
          ${isRecording 
            ? "bg-accent/10 border-2 border-accent shadow-[0_0_30px_rgba(78,255,163,0.3)] animate-[micPulse_2s_infinite]" 
            : "bg-surface border-2 border-border hover:border-muted-foreground"
          }
        `}
      >
        {isRecording ? (
          <Square className="w-7 h-7 text-accent fill-accent/20" />
        ) : (
          <Mic className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
      
      <p className="text-sm font-medium h-4">
        {isRecording ? (
          <span className="text-accent animate-pulse">Listening... speak naturally</span>
        ) : (
          <span className="text-muted-foreground">Click the mic to answer</span>
        )}
      </p>
    </div>
  );
}
