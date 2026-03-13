"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ReportData {
    overall_score: number
    clarity_score: number
    confidence_score: number
    relevance_score: number
    depth_score: number
    total_filler_words: number
    avg_speaking_pace: number
    answers: AnswerData[]
    strengths: string[]
    improvements: string[]
    coaching_tips: string[]
}

interface AnswerData {
    question_id: number
    question_text: string
    question_type: string
    your_answer: string
    ideal_answer: string
    score: number
    feedback: string
}

const tipCards = [
    { icon: "💪", title: "Your Strengths", type: "strength", key: "strengths" },
    { icon: "🎯", title: "Top Priority to Fix", type: "improve", key: "improvements" },
    { icon: "🧘", title: "On Confidence", type: "advice", custom: "When you don't know something, say: \"That's a great question — let me think through this.\" Pausing confidently is better than rushing nervously." },
    { icon: "📏", title: "Answer Length", type: "advice", custom: "For behavioral questions, aim for 90–120 seconds. For technical, go longer — show your thinking." },
    { icon: "🔢", title: "Add Numbers Everywhere", type: "improve", custom: "\"Improved performance\" is weak. \"Reduced API response time by 40%\" is memorable. Quantify every bullet." },
    { icon: "📈", title: "Keep Going", type: "strength", custom: "Review each question, identify patterns in weak answers, and retry the questions you struggled most with." },
]

const tipClass = (type: string) =>
    type === "strength"
        ? "bg-primary/5 border-primary/20"
        : type === "improve"
        ? "bg-destructive/5 border-destructive/20"
        : "bg-accent-4/5 border-accent-4/20"

const scoreBadgeClass = (score: number) =>
    score >= 8
        ? "bg-primary/10 border border-primary/30 text-primary"
        : score >= 6
        ? "bg-accent-4/10 border border-accent-4/30 text-accent-4"
        : "bg-destructive/10 border border-destructive/30 text-destructive"

export default function ReportPage() {
    const router = useRouter()
    const [report, setReport] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedQ, setExpandedQ] = useState<number | null>(0)

    const fetchReport = useCallback(async (sid: string) => {
        try {
            const res = await fetch(`${API_BASE}/sessions/${sid}/report`)
            if (res.ok) {
                const data = await res.json()
                setReport(data)
            }
        } catch {
            // API not reachable — fall through to demo data
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const sid = localStorage.getItem("prepsense_session_id")
        if (!sid) {
            setLoading(false)
            return
        }
        fetchReport(sid)
    }, [router, fetchReport])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="font-heading text-lg font-bold text-muted-foreground">Generating your report...</p>
            </div>
        )
    }

    const overall = report?.overall_score ?? 78
    const clarity = report?.clarity_score ?? 8.1
    const confidence = report?.confidence_score ?? 6.4
    const relevance = report?.relevance_score ?? 8.8
    const depth = report?.depth_score ?? 5.9
    const fillerWords = report?.total_filler_words ?? 14
    const avgPace = report?.avg_speaking_pace ?? 118

    const scoreMetrics = [
        { label: "Clarity", val: clarity, colorClass: "text-primary", barClass: "bg-primary", pct: clarity * 10 },
        { label: "Confidence", val: confidence, colorClass: "text-accent-4", barClass: "bg-accent-4", pct: confidence * 10 },
        { label: "Relevance", val: relevance, colorClass: "text-primary", barClass: "bg-primary", pct: relevance * 10 },
        { label: "Depth", val: depth, colorClass: "text-destructive", barClass: "bg-destructive", pct: depth * 10 },
    ]

    const voiceStats = [
        { label: 'Total "Umm/Uh" Used', val: `${fillerWords}`, suffix: "times", colorClass: "text-destructive" },
        { label: "Avg Speaking Pace", val: `${avgPace}`, suffix: "WPM", colorClass: "text-accent-4" },
        { label: "Longest Silence", val: "8.2s", suffix: "Q7", colorClass: "text-destructive" },
        { label: "Best Question", val: "Q4", suffix: "9.1/10", colorClass: "text-primary" },
    ]

    return (
        <div className="w-full pb-24 bg-background text-foreground">
            <div className="max-w-[1000px] mx-auto px-6 pt-16">

                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-12 flex-wrap gap-6">
                    <div>
                        <div className="text-[13px] font-semibold uppercase tracking-[1px] mb-2 text-muted-foreground">Interview Complete</div>
                        <h1 className="font-heading text-[40px] font-extrabold tracking-[-1px] mb-2">Your Report Card</h1>
                        <p className="text-muted-foreground">Software Engineer · Mixed · {report?.answers?.length ?? 10} Questions</p>
                        <div className="flex gap-2 flex-wrap mt-4">
                            {[
                                { label: "Friendly Senior Mode", className: "bg-primary/10 text-primary" },
                                { label: "Medium Difficulty", className: "bg-accent-2/10 text-accent-2" },
                                { label: "Fresher", className: "bg-accent-4/10 text-accent-4" },
                            ].map((b) => (
                                <span key={b.label} className={cn("px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-[0.5px]", b.className)}>{b.label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Score Ring */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-[130px] h-[130px] rounded-full flex items-center justify-center"
                                style={{ background: `conic-gradient(var(--primary) 0% ${overall}%, var(--border) ${overall}% 100%)` }}
                            >
                                <div className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center bg-background">
                                    <div className="font-heading text-[32px] font-extrabold leading-none">{overall}</div>
                                    <div className="text-[11px] font-semibold tracking-[1px] mt-0.5 text-muted-foreground">/100</div>
                                </div>
                            </div>
                            <div className="text-[13px] font-semibold text-muted-foreground">Overall Score</div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                                ⬇ Download PDF Report
                            </button>
                            <button onClick={() => router.push("/upload")} className="text-[12px] text-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors">🔄 Try Again</button>
                        </div>
                    </div>
                </div>

                {/* ── Score Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {scoreMetrics.map((s) => (
                        <div key={s.label} className="rounded-[16px] p-6 transition-all duration-200 bg-card border border-border hover:border-primary/30 hover:-translate-y-0.5 shadow-sm">
                            <div className="text-[12px] font-semibold uppercase tracking-[1px] mb-2 text-muted-foreground">{s.label}</div>
                            <div className={cn("font-heading text-[40px] font-extrabold leading-none mb-3", s.colorClass)}>{s.val}</div>
                            <div className="rounded-full h-1.5 bg-border">
                                <div className={cn("h-full rounded-full", s.barClass)} style={{ width: `${s.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Voice Analysis ── */}
                <div className="rounded-[16px] p-5 mb-8 flex gap-6 flex-wrap bg-card border border-border shadow-sm">
                    {voiceStats.map((v) => (
                        <div key={v.label}>
                            <div className="text-[11px] font-bold uppercase tracking-[1px] mb-1.5 text-muted-foreground">{v.label}</div>
                            <div className={cn("font-heading text-[36px] font-extrabold leading-none", v.colorClass)}>
                                {v.val} <span className="font-body text-sm text-muted-foreground">{v.suffix}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Q&A Breakdown ── */}
                <div className="mb-12">
                    <h2 className="font-heading text-[24px] font-extrabold mb-6">Question-by-Question Breakdown</h2>
                    {(report?.answers ?? DEMO_ANSWERS).map((qa, i) => (
                        <div
                            key={i}
                            className="rounded-[20px] p-7 mb-4 cursor-pointer transition-all duration-200 bg-card border border-border hover:border-primary/30 hover:-translate-y-0.5 shadow-sm"
                            onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold uppercase tracking-[1px] mb-1.5 text-muted-foreground">
                                        Q{i + 1} · {qa.question_type || "Behavioral"}
                                    </div>
                                    <div className="text-base font-semibold">{qa.question_text}</div>
                                </div>
                                <div className={cn("px-3.5 py-1 rounded-full text-[13px] font-bold whitespace-nowrap", scoreBadgeClass(qa.score))}>
                                    {qa.score.toFixed(1)} / 10
                                </div>
                            </div>

                            {expandedQ === i && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="rounded-xl p-4 text-sm leading-[1.7] bg-accent-2/5 border border-accent-2/20">
                                            <div className="text-[11px] font-bold uppercase tracking-[1px] mb-2 text-accent-2">Your Answer</div>
                                            <p className="text-muted-foreground">{qa.your_answer}</p>
                                        </div>
                                        <div className="rounded-xl p-4 text-sm leading-[1.7] bg-primary/5 border border-primary/20">
                                            <div className="text-[11px] font-bold uppercase tracking-[1px] mb-2 text-primary">Ideal Answer Structure</div>
                                            <p className="text-muted-foreground">{qa.ideal_answer}</p>
                                        </div>
                                    </div>
                                    {qa.feedback && (
                                        <div className="mt-4 rounded-[10px] px-4 py-3.5 text-[13px] leading-[1.6] bg-accent-4/5 border border-accent-4/20 text-muted-foreground">
                                            <strong className="text-accent-4">💡 What to improve:</strong> {qa.feedback}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Tips ── */}
                <div className="rounded-[24px] p-9 mb-12 bg-card border border-border shadow-sm">
                    <h2 className="font-heading text-[24px] font-extrabold mb-6">Personal Coaching Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tipCards.map((tip) => {
                            const text = tip.key === "strengths"
                                ? (report?.strengths?.[0] ?? "Technical depth is excellent. You explain complex concepts clearly.")
                                : tip.key === "improvements"
                                ? (report?.improvements?.[0] ?? "Reduce filler words. Record yourself for 2 minutes daily — awareness alone reduces them 60%.")
                                : tip.custom
                            return (
                                <div key={tip.title} className={cn("rounded-[16px] p-5 border", tipClass(tip.type))}>
                                    <div className="text-[28px] mb-3">{tip.icon}</div>
                                    <h4 className="font-heading text-[15px] font-bold mb-1.5">{tip.title}</h4>
                                    <p className="text-[13px] leading-[1.6] text-muted-foreground">{text}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => router.push("/upload")} className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                        🔄 Retry Weak Questions
                    </button>
                    <button className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm border border-border hover:bg-muted transition-colors text-foreground">
                        📊 View Progress Dashboard
                    </button>
                    <button className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm border border-border hover:bg-muted transition-colors text-foreground">
                        📤 Share Score Card
                    </button>
                </div>
            </div>
        </div>
    )
}

const DEMO_ANSWERS: AnswerData[] = [
    { question_id: 1, question_text: "You built a payment gateway — describe a specific technical failure and how you resolved it.", question_type: "Behavioral", your_answer: "So we had this issue where webhook events were coming out of order causing duplicate charges. I implemented idempotency keys... um... it took about 2 weeks to fully fix.", ideal_answer: "Situation: 'We processed 10K+ daily transactions when we noticed a 0.3% duplicate charge rate...' Action: 'I designed an idempotency layer using Redis with TTL...' Result: 'Reduced duplicate charges to zero within 48 hours.'", score: 6.8, feedback: "Good technical content but missing quantification. Add specific numbers (error rate, users affected, time to fix). Lead with the impact first, then explain the solution." },
    { question_id: 2, question_text: "Design a URL shortener like bit.ly. Walk through your approach.", question_type: "Technical", your_answer: "I'd use a hash function to generate short codes, store them in a database with the mapping, use Redis cache for frequent lookups...", ideal_answer: "Cover: Functional requirements → API design → Hash generation (base62 encoding) → DB schema → Caching layer → Scalability considerations.", score: 9.1, feedback: "" },
    { question_id: 3, question_text: "What's your biggest weakness?", question_type: "HR", your_answer: "Um... I think... I sometimes work too hard? I'm kind of a perfectionist... [8 second pause] ...yeah, I guess that's my weakness.", ideal_answer: "Real weakness: 'I used to struggle with delegating — I'd rewrite teammates' code...' What you did: 'I started doing code reviews instead...' Growth: 'Now my team's velocity improved 30%.'", score: 4.2, feedback: "'Perfectionist' is the most overused interview answer and raises red flags. Pick a real, minor weakness and show how you actively fixed it." },
]
