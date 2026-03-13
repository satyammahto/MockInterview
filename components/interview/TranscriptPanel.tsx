import { useEffect, useRef } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface TranscriptPanelProps {
  transcript: string;
  interimTranscript?: string;
  isProcessing?: boolean;
}

export function TranscriptPanel({ transcript, interimTranscript = "", isProcessing = false }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto scroll to bottom as transcript grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript, isProcessing]);

  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden relative group">
      <div className="px-5 py-4 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span>📝</span> Live Transcript
        </h3>
        {transcript && (
          <button 
            onClick={copyToClipboard}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded-md text-muted-foreground hover:text-foreground"
            title="Copy transcript"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div 
        ref={containerRef}
        className="p-5 overflow-y-auto flex-1 text-[15px] leading-relaxed relative"
      >
        {!transcript && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 italic text-sm text-center px-10">
            Start speaking to see your answer transcribed here in real-time...
          </div>
        )}
        
        <p className="text-foreground/90 whitespace-pre-wrap">
          {transcript}
          {interimTranscript && (
            <span className="text-muted-foreground/50 italic transition-opacity">
              {" "}{interimTranscript}
            </span>
          )}
        </p>

        {isProcessing && (
          <div className="flex items-center gap-2 mt-4 text-sm text-accent animate-pulse">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}/>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }}/>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}/>
            </span>
            <span>Transcribing...</span>
          </div>
        )}
      </div>
      
      {/* Fade out bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
    </div>
  );
}
