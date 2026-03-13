"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, Award, Loader2 } from "lucide-react"
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
                if (res.status === 404) throw new Error("Report not ready yet. Please complete the interview first.")
                throw new Error("Failed to load report.")
            }
            const data: Report = await res.json()
            setReport(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not load report.")
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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">

            {/* Header & Overall Score */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[32px] p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-80 h-80 bg-accent-2/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-md mb-6 border border-accent/20">
                        <Award className="w-4 h-4" /> Analysis Complete
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Your Interview <br /><span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">Performance Report</span>
                    </h1>
                    <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
                        {report.summary_message || "Great effort! Review your detailed feedback below."}
                    </p>
                </div>

                {/* Score Ring */}
                <div className="relative w-48 h-48 shrink-0 flex items-center justify-center bg-background/50 rounded-full border border-border/50 shadow-inner">
                    <svg className="w-full h-full transform -rotate-90 scale-90">
                        <circle cx="96" cy="96" r="80" stroke="var(--border)" strokeWidth="12" fill="none" opacity="0.5" />
                        <circle
                            cx="96" cy="96" r="80"
                            stroke="var(--accent-1)" strokeWidth="12" fill="none"
                            strokeDasharray="502" strokeDashoffset={502 - (502 * report.overall_score) / 100}
                            className="transition-all duration-1500 ease-out"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-[0_0_15px_rgba(78,255,163,0.3)]">
                        <span className="font-heading text-6xl font-black text-foreground tracking-tighter">{Math.round(report.overall_score)}</span>
                        <span className="text-xs font-bold text-accent uppercase tracking-widest mt-1">Overall</span>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent-2 animate-pulse" /> Synthesis Breakdown
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {scores.map((s, i) => (
                        <Card key={i} className="bg-surface/50 border-border/50 hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-xl group backdrop-blur-md rounded-2xl overflow-hidden relative">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-border/50">
                                <div className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                                    style={{ width: `${s.score}%`, backgroundColor: s.color, color: s.color }} />
                            </div>
                            <CardContent className="p-6">
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 group-hover:text-foreground transition-colors">{s.label}</div>
                                <div className="font-heading text-4xl font-black tabular-nums">{Math.round(s.score)}<span className="text-base text-muted-foreground ml-1 font-medium">/100</span></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Question Analysis */}
            <div className="relative z-10 pb-12">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent-4 shadow-[0_0_10px_var(--accent-4)]" /> Question Analysis
                </h2>

                <div className="space-y-6">
                    {report.feedback.map((item, i) => (
                        <div
                            key={i}
                            className={cn(
                                "bg-surface/50 border rounded-[24px] overflow-hidden transition-all duration-300 backdrop-blur-md",
                                expandedQ === i ? "border-accent-2/50 shadow-[0_0_30px_rgba(123,97,255,0.1)]" : "border-border/50 hover:border-accent/30 shadow-lg"
                            )}
                        >
                            <div
                                className="p-6 md:p-8 flex items-start gap-5 cursor-pointer select-none group"
                                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            >
                                <div className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap hidden sm:block shadow-inner",
                                    item.score >= 80 ? "bg-accent/10 text-accent border border-accent/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                                )}>
                                    {Math.round(item.score)}/100
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-heading text-xl font-bold text-foreground leading-snug group-hover:text-accent-2 transition-colors pr-8">
                                        {item.question_text}
                                    </h3>
                                </div>
                                <div className={cn(
                                    "w-10 h-10 rounded-full bg-background/50 flex items-center justify-center shrink-0 transition-transform duration-300 border border-border/50",
                                    expandedQ === i && "rotate-180 bg-accent-2/10 border-accent-2/30"
                                )}>
                                    <ChevronDown className={cn("w-5 h-5", expandedQ === i ? "text-accent-2" : "text-muted-foreground")} />
                                </div>
                            </div>

                            <div className={cn(
                                "grid transition-all duration-500 ease-in-out px-6 md:px-8",
                                expandedQ === i ? "grid-rows-[1fr] pb-8 opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}>
                                <div className="overflow-hidden">
                                    <div className="grid md:grid-cols-2 gap-6 mt-4 pt-6 border-t border-border/40">
                                        <div className="bg-background/40 border border-border/50 rounded-2xl p-6">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" /> Transcript Snippet
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-body italic">
                                                {item.your_answer ? `"${item.your_answer}"` : <em className="text-muted-foreground">No answer recorded</em>}
                                            </p>
                                        </div>
                                        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 shadow-[inset_0_0_20px_rgba(78,255,163,0.05)]">
                                            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Ideal Approach
                                            </div>
                                            <p className="text-sm text-foreground/90 leading-relaxed font-body">
                                                &quot;{item.ideal_answer}&quot;
                                            </p>
                                        </div>
                                    </div>

                                    {item.tips && item.tips.length > 0 && (
                                        <div className="mt-6 bg-accent-2/5 rounded-[20px] p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-start border border-accent-2/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-2/10 rounded-full blur-[40px] pointer-events-none" />
                                            <div className="w-12 h-12 rounded-2xl bg-accent-2/10 border border-accent-2/30 flex items-center justify-center shrink-0 text-accent-2">
                                                <Lightbulb className="w-6 h-6" />
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <div className="text-sm font-heading font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
                                                    Coaching Tips
                                                    <span className="text-[10px] text-accent-2 bg-accent-2/10 px-2 py-0.5 rounded-full">AI Recommendations</span>
                                                </div>
                                                <ul className="space-y-3">
                                                    {item.tips.map((tip, idx) => (
                                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
                                                            <div className="w-5 h-5 rounded-full bg-accent-2/20 text-accent-2 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</div>
                                                            <span className="leading-relaxed">{tip}</span>
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
