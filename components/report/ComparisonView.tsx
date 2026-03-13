import { CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

interface ComparisonViewProps {
  yourAnswer: string;
  idealAnswer: string;
  feedback: string;
}

export function ComparisonView({ yourAnswer, idealAnswer, feedback }: ComparisonViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {/* Your Answer Column */}
      <div className="bg-[#1a172c]/40 border border-[#7B61FF]/20 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#7B61FF] mb-3">
          <ChevronRight className="w-3 h-3" />
          Your Answer
        </h4>
        <p className="text-sm leading-relaxed text-foreground/80 relative z-10">
          {yourAnswer || <i>(No answer provided)</i>}
        </p>
        
        {feedback && (
          <div className="mt-4 pt-4 border-t border-[#7B61FF]/20">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-[#FFD166] mb-2">
              <AlertCircle className="w-3.5 h-3.5" /> What to improve
            </h5>
            <p className="text-[13px] leading-relaxed text-[#FFD166]/90">
              {feedback}
            </p>
          </div>
        )}
      </div>

      {/* Ideal Answer Column */}
      <div className="bg-[#0e201b]/40 border border-[#4EFFA3]/20 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4EFFA3]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#4EFFA3] mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ideal Answer Structure
        </h4>
        <div className="text-sm leading-relaxed text-foreground/80 relative z-10 space-y-3">
          {/* Split ideal answer by common bullet patterns for better readability if possible */}
          {idealAnswer.split(/(?=\b(?:Situation|Task|Action|Result|Cover):|•)/i).map((part, i) => (
            <p key={i} className="mb-1">{part.trim()}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
