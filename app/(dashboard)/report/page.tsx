"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface FeedbackItem {
    question_id: number
    question_text: string
    question_type: string
    score: number
    your_answer: string
    ideal_answer: string
    tips: string[]
}

interface Report {
    overall_score: number
    metrics: {
        confidence: number
        clarity: number
        relevance: number
        pacing: number
    }
    feedback: FeedbackItem[]
    strengths: string[]
    improvements: string[]
    advice: string[]
    summary_message: string
}

export default function ReportPage() {
    const router = useRouter()
    const [expandedQ, setExpandedQ] = useState<number | null>(0)
    const [report, setReport] = useState<Report | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // Fetch report from API on mount
    useEffect(() => {
        const sessionId = localStorage.getItem("prepsense_session_id")
        if (!sessionId) {
            router.replace("/upload")
            return
        }
        fetchReport(sessionId)
    }, [router])

    const fetchReport = async (sessionId: string) => {
        try {
            const res = await fetch(`${API_BASE}/sessions/${sessionId}/report`)
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Report not ready yet. Please complete the interview first.")
                }
                throw new Error("Failed to load report.")
            }
            const data: Report = await res.json()
            setReport(data)
        } catch (err: any) {
            setError(err.message || "Could not load report.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
                <p className="text-muted-foreground text-sm font-medium">Generating your AI feedback report...</p>
            </div>
        )
    }

    if (error || !report) {
        return (
            <div className="max-w-xl mx-auto text-center space-y-6 py-20">
                <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
                    <p className="font-bold mb-2">Report Unavailable</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <button onClick={() => router.push("/upload")}
                    className="px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-all">
                    Start New Interview
                </button>
            </div>
        )
    }

    const scores = [
        { label: "Confidence", score: report.metrics.confidence, color: "var(--accent-1)" },
        { label: "Clarity", score: report.metrics.clarity, color: "var(--accent-4)" },
        { label: "Relevance", score: report.metrics.relevance, color: "var(--accent-1)" },
        { label: "Pacing", score: report.metrics.pacing, color: "var(--accent-3)" },
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
                        {report.summary_message}
                    </p>
                </div>

                {/* Big Ring */}
                <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="var(--border)" strokeWidth="8" fill="none" />
                        <circle
                            cx="80" cy="80" r="70"
                            stroke="var(--accent-1)" strokeWidth="8" fill="none"
                            strokeDasharray="440" strokeDashoffset={440 - (440 * report.overall_score) / 100}
                            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_var(--accent-1)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-heading text-5xl font-extrabold">{Math.round(report.overall_score)}</span>
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
                    {report.feedback.map((item, i) => (
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
                                    {Math.round(item.score)}/100
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground pr-8">{item.question_text}</h3>
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
                                                {item.your_answer ? `"${item.your_answer}"` : <em className="text-muted-foreground">No answer recorded</em>}
                                            </p>
                                        </div>

                                        {/* Ideal Answer */}
                                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 relative">
                                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Answer Structure
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-body">
                                                &quot;{item.ideal_answer}&quot;
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tips list */}
                                    {item.tips && item.tips.length > 0 && (
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
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths / Improvements */}
            {(report.strengths?.length > 0 || report.improvements?.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {report.strengths?.length > 0 && (
                        <div className="bg-accent/5 border border-accent/15 rounded-2xl p-6">
                            <h3 className="font-heading text-base font-bold text-accent mb-4">✅ Strengths</h3>
                            <ul className="space-y-2">
                                {report.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                        <span className="text-accent mt-1">→</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {report.improvements?.length > 0 && (
                        <div className="bg-destructive/5 border border-destructive/15 rounded-2xl p-6">
                            <h3 className="font-heading text-base font-bold text-destructive mb-4">📈 Areas to Improve</h3>
                            <ul className="space-y-2">
                                {report.improvements.map((s, i) => (
                                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                        <span className="text-destructive mt-1">→</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
                <button
                    onClick={() => { localStorage.clear(); router.push("/upload") }}
                    className="px-8 py-3 rounded-xl font-heading font-bold bg-accent text-black hover:bg-accent/90 transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(78,255,163,0.25)]"
                >
                    Start New Interview
                </button>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="px-8 py-3 rounded-xl font-heading font-semibold border border-border hover:bg-surface transition-all"
                >
                    View Dashboard
                </button>
            </div>
        </div>
    )
}
