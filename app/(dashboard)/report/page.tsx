"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function ReportPage() {
    const [expandedQ, setExpandedQ] = useState<number | null>(0)

    const scores = [
        { label: "Confidence", score: 88, color: "var(--accent-1)" },
        { label: "Clarity", score: 72, color: "var(--accent-4)" },
        { label: "Relevance", score: 95, color: "var(--accent-1)" },
        { label: "Pacing", score: 65, color: "var(--accent-3)" },
    ]

    const feedback = [
        {
            q: "Tell me about a time you had to optimize a React Native application.",
            score: 85,
            tag: "good",
            yours: "I used React.memo on a few list items and it seemed to help the frame rate go up according to the React dev tools.",
            ideal: "I profiled the application using React DevTools and identified unnecessary re-renders in a FlatList. By implementing React.memo with a custom comparison function for list items and extracting inline functions, I improved scrolling performance from 40fps to a stable 60fps.",
            tips: ["Quantify your results with specific metrics (e.g., 40fps to 60fps)", "Mention specific tools (React DevTools)"]
        },
        {
            q: "How do you handle disagreements with product managers?",
            score: 60,
            tag: "improve",
            yours: "Usually I just argue my case until they agree or we compromise.",
            ideal: "I approach disagreements as an opportunity for alignment. I ask for the data driving their decision, present technical constraints clearly, and try to find a solution that satisfies both user needs and technical viability.",
            tips: ["Avoid confrontational language ('argue')", "Focus on collaboration and data-driven decisions"]
        }
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* Header & Overall Score */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-surface border border-border rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

                <div>
                    <div className="text-accent font-bold tracking-[3px] uppercase text-xs mb-2">Analysis Complete</div>
                    <h1 className="font-heading text-4xl font-extrabold tracking-tight mb-4">Interview Report</h1>
                    <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        Great effort! Your technical knowledge is solid, but there is room for improvement in behavioral structuring (STAR method) and pacing.
                    </p>
                </div>

                {/* Big Ring */}
                <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="var(--border)" strokeWidth="8" fill="none" />
                        <circle
                            cx="80" cy="80" r="70"
                            stroke="var(--accent-1)" strokeWidth="8" fill="none"
                            strokeDasharray="440" strokeDashoffset={440 - (440 * 78) / 100}
                            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_var(--accent-1)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-heading text-5xl font-extrabold">78</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
                    </div>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div>
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" /> Metric Breakdown
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {scores.map((s, i) => (
                        <Card key={i} className="bg-surface border-border hover:border-accent/30 transition-colors">
                            <CardContent className="p-6">
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{s.label}</div>
                                <div className="font-heading text-3xl font-extrabold mb-3">{s.score}<span className="text-sm text-muted-foreground ml-1">/100</span></div>
                                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${s.score}%`, backgroundColor: s.color }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Q&A Review */}
            <div>
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-2)]" /> Detailed Review
                </h2>

                <div className="space-y-4">
                    {feedback.map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "bg-surface border rounded-2xl overflow-hidden transition-all duration-300",
                                expandedQ === i ? "border-accent/40" : "border-border hover:border-accent/20"
                            )}
                        >
                            <div
                                className="p-6 flex items-start gap-4 cursor-pointer select-none"
                                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            >
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block",
                                    item.score >= 80 ? "bg-accent/10 text-accent border border-accent/20" :
                                        "bg-destructive/10 text-destructive border border-destructive/20"
                                )}>
                                    {item.score}/100
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground pr-8">{item.q}</h3>
                                </div>

                                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0", expandedQ === i && "rotate-180")} />
                            </div>

                            <div className={cn(
                                "grid transition-all duration-300 ease-in-out px-6",
                                expandedQ === i ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="overflow-hidden">
                                    <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">

                                        {/* Your Answer */}
                                        <div className="bg-[var(--accent-2)]/5 border border-[var(--accent-2)]/20 rounded-xl p-5 relative">
                                            <div className="text-[10px] font-bold text-[var(--accent-2)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Your Answer
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-body">
                                                &quot;{item.yours}&quot;
                                            </p>
                                        </div>

                                        {/* Ideal Answer */}
                                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 relative">
                                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Answer Structure
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-body">
                                                &quot;{item.ideal}&quot;
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tips list */}
                                    <div className="mt-4 bg-muted/40 rounded-xl p-4 flex gap-3 items-start border border-border/50">
                                        <Lightbulb className="w-5 h-5 text-[var(--accent-4)] shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">AI Recommendations</div>
                                            <ul className="space-y-1.5">
                                                {item.tips.map((tip, idx) => (
                                                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-border" /> {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
