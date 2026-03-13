import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Mic, AlertTriangle, TrendingUp, TrendingDown, PauseCircle } from "lucide-react";

interface FillerWord {
  word: string;
  count: number;
}

interface VoiceAnalysisProps {
  fillerWords: FillerWord[];
  totalFillerWords: number;
  wpm: number;
  pauseCount: number;
}

export function VoiceAnalysis({ fillerWords, totalFillerWords, wpm, pauseCount }: VoiceAnalysisProps) {
  // Take top 5 filler words for the chart
  const topFillers = [...fillerWords].sort((a, b) => b.count - a.count).slice(0, 5);

  const getWpmStatus = () => {
    if (wpm < 110) return { text: "Too Slow", icon: TrendingDown, color: "text-[#FFD166]" };
    if (wpm > 160) return { text: "Too Fast", icon: TrendingUp, color: "text-[#FF6B6B]" };
    return { text: "Good Pace", icon: Mic, color: "text-[#4EFFA3]" };
  };

  const status = getWpmStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-2xl border border-border">
      {/* Metrics Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Voice Metrics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a172c]/30 rounded-xl p-4 border border-[#7B61FF]/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-xs font-semibold uppercase">Filler Words</span>
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground">{totalFillerWords}</div>
              <p className="text-xs text-muted-foreground mt-1 text-[#FFD166]">Try to aim below 5 per session</p>
            </div>
            
            <div className="bg-[#0e201b]/30 rounded-xl p-4 border border-[#4EFFA3]/10">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <status.icon className={`w-4 h-4 ${status.color}`} />
                <span className="text-xs font-semibold uppercase">Speaking Pace</span>
              </div>
              <div className="font-heading text-3xl font-extrabold text-foreground">{wpm} <span className="text-sm font-normal text-muted-foreground">WPM</span></div>
              <p className={`text-xs mt-1 ${status.color}`}>{status.text}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-border col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <PauseCircle className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold uppercase">Significant Pauses</span>
              </div>
              <div className="font-heading text-2xl font-extrabold text-foreground">{pauseCount} <span className="text-sm font-normal text-muted-foreground">detected</span></div>
              <p className="text-[11px] text-muted-foreground mt-1">Pauses over 2 seconds (good for emphasis, bad mid-sentence)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Column */}
      <div className="flex flex-col">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Most Used Fillers</h3>
        {topFillers.length > 0 ? (
          <div className="h-full min-h-[160px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFillers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="word" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8892A4', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,107,107,0.1)' }}
                  contentStyle={{ backgroundColor: '#0E1220', borderColor: '#1E2535', borderRadius: '8px' }}
                  itemStyle={{ color: '#FF6B6B' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#FF6B6B" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-border rounded-xl flex items-center justify-center flex-col text-center p-6 bg-surface/50">
            <span className="text-4xl mb-3">🎙️</span>
            <p className="text-sm font-bold text-foreground/80">Fantastic!</p>
            <p className="text-xs text-muted-foreground mt-1">No filler words detected in your answers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
