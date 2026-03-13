"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { ScoreCard } from "@/components/report/ScoreCard"
import { VoiceAnalysis } from "@/components/report/VoiceAnalysis"
import { ComparisonView } from "@/components/report/ComparisonView"

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
    // Confidence Analysis (Feature 2)
    confidence_analysis?: {
        confidence_score: number
        filler_word_count: number
        pace_wpm: number
        top_filler_words: { word: string; count: number }[]
        issues: string[]
    }
    // STAR Evaluation (Feature 3)
    star_evaluation?: {
        star_score: number
        per_question: {
            situation: boolean
            task: boolean
            action: boolean
            result: boolean
            star_score: number
            missing_components: string[]
        }[]
    }
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

const tipStyle = (type: string) => ({
    card: type === "strength"
        ? { background: 'rgba(78,255,163,0.05)', borderColor: 'rgba(78,255,163,0.15)' }
        : type === "improve"
        ? { background: 'rgba(255,107,107,0.05)', borderColor: 'rgba(255,107,107,0.15)' }
        : { background: 'rgba(255,209,102,0.05)', borderColor: 'rgba(255,209,102,0.15)' },
})

export default function ReportPage() {
    const router = useRouter()
    const [report, setReport] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedQ, setExpandedQ] = useState<number | null>(0)
    const [mounted, setMounted] = useState(false)

    // ── Define fetchReport before useEffect calls it ──
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
        setMounted(true)
        const sid = localStorage.getItem("prepsense_session_id")
        if (!sid) {
            // No session — show demo report immediately instead of redirecting
            setLoading(false)
            return
        }
        fetchReport(sid)
    }, [router, fetchReport])

    const scoreColor = (score: number) => score >= 8 ? '#4EFFA3' : score >= 6 ? '#FFD166' : '#FF6B6B'
    const scoreBadgeStyle = (score: number) => score >= 8
        ? { background: 'rgba(78,255,163,0.1)', border: '1px solid rgba(78,255,163,0.2)', color: '#4EFFA3' }
        : score >= 6
        ? { background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)', color: '#FFD166' }
        : { background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: '#080B14' }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#4EFFA3' }} />
                <p className="font-heading text-lg font-bold" style={{ color: '#8892A4' }}>Generating your report...</p>
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

    const conicPct = Math.round(overall * 0.78)

    return (
        <div className="w-full pb-24" style={{ background: '#080B14', color: '#E8EDF5' }}>
            <div className="max-w-[1000px] mx-auto px-6 pt-16">

                {/* ── Header ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-start mb-12 flex-wrap gap-6"
                >
                    <div>
                        <div className="text-[13px] font-semibold uppercase tracking-[1px] mb-2" style={{ color: '#4A5568' }}>Interview Complete</div>
                        <h1 className="font-heading text-[40px] font-extrabold tracking-[-1px] mb-2">Your Report Card</h1>
                        <p style={{ color: '#8892A4' }}>Software Engineer · Mixed · {report?.answers?.length ?? 10} Questions</p>
                        <div className="flex gap-2 flex-wrap mt-4">
                            {[
                                { label: "Friendly Senior Mode", style: { background: 'rgba(78,255,163,0.12)', color: '#4EFFA3' } },
                                { label: "Medium Difficulty", style: { background: 'rgba(123,97,255,0.12)', color: '#7B61FF' } },
                                { label: "Fresher", style: { background: 'rgba(255,209,102,0.12)', color: '#FFD166' } },
                            ].map((b) => (
                                <span key={b.label} className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-[0.5px]" style={b.style}>{b.label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Score Ring */}
                        <ScoreCard score={overall} label="Overall Score" color={scoreColor(overall)} />

                        {/* CTA */}
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-sm text-black transition-transform hover:scale-105" style={{ background: '#4EFFA3' }}>
                                ⬇ Download PDF Report
                            </button>
                            <button onClick={() => router.push("/upload")} className="text-[12px] text-center cursor-pointer hover:text-white transition-colors" style={{ color: '#4A5568' }}>🔄 Try Again</button>
                        </div>
                    </div>
                </motion.div>

                {/* ── Score Cards ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {[
                        { label: "Clarity", val: clarity, color: '#4EFFA3', pct: clarity * 10 },
                        { label: "Confidence", val: confidence, color: '#FFD166', pct: confidence * 10 },
                        { label: "Relevance", val: relevance, color: '#4EFFA3', pct: relevance * 10 },
                        { label: "Depth", val: depth, color: '#FF6B6B', pct: depth * 10 },
                    ].map((s) => (
                        <div key={s.label} className="rounded-[16px] p-6 transition-all duration-200" style={{ background: '#0E1220', border: '1px solid #1E2535' }}
                            onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(78,255,163,0.2)' }}
                            onMouseLeave={(e) => { (e.currentTarget).style.borderColor = '#1E2535' }}
                        >
                            <div className="text-[12px] font-semibold uppercase tracking-[1px] mb-2" style={{ color: '#4A5568' }}>{s.label}</div>
                            <div className="font-heading text-[40px] font-extrabold leading-none mb-3" style={{ color: s.color }}>{s.val}</div>
                            <div className="rounded-full h-1" style={{ background: '#1E2535' }}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.pct}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="h-full rounded-full" 
                                    style={{ background: s.color }} 
                                />
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Voice Analysis ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <VoiceAnalysis 
                        wpm={report?.confidence_analysis?.pace_wpm ?? avgPace}
                        totalFillerWords={report?.confidence_analysis?.filler_word_count ?? fillerWords}
                        pauseCount={4}
                        fillerWords={
                            report?.confidence_analysis?.top_filler_words?.length
                                ? report.confidence_analysis.top_filler_words
                                : [
                                    { word: "um", count: Math.max(1, Math.floor(fillerWords * 0.4)) },
                                    { word: "like", count: Math.max(1, Math.floor(fillerWords * 0.3)) },
                                    { word: "you know", count: Math.max(0, Math.floor(fillerWords * 0.2)) },
                                    { word: "basically", count: Math.max(0, Math.floor(fillerWords * 0.1)) }
                                ]
                        }
                    />

                    {/* ── Confidence Analysis ── */}
                    <div className="rounded-[20px] p-7 mt-6" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
                        <h3 className="font-heading text-[20px] font-extrabold mb-5 flex items-center gap-2">
                            🧠 Confidence Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                            <div className="rounded-[14px] p-5" style={{ background: '#080B14', border: '1px solid #1E2535' }}>
                                <div className="text-[11px] font-semibold uppercase tracking-[1px] mb-1" style={{ color: '#4A5568' }}>Confidence Score</div>
                                <div className="font-heading text-[36px] font-extrabold" style={{ color: (report?.confidence_analysis?.confidence_score ?? confidence) >= 70 ? '#4EFFA3' : (report?.confidence_analysis?.confidence_score ?? confidence) >= 50 ? '#FFD166' : '#FF6B6B' }}>
                                    {report?.confidence_analysis?.confidence_score ?? Math.round(confidence * 10)}
                                    <span className="text-[16px] font-medium" style={{ color: '#4A5568' }}> / 100</span>
                                </div>
                            </div>
                            <div className="rounded-[14px] p-5" style={{ background: '#080B14', border: '1px solid #1E2535' }}>
                                <div className="text-[11px] font-semibold uppercase tracking-[1px] mb-1" style={{ color: '#4A5568' }}>Filler Words</div>
                                <div className="font-heading text-[36px] font-extrabold" style={{ color: (report?.confidence_analysis?.filler_word_count ?? fillerWords) <= 5 ? '#4EFFA3' : '#FF6B6B' }}>
                                    {report?.confidence_analysis?.filler_word_count ?? fillerWords}
                                </div>
                            </div>
                            <div className="rounded-[14px] p-5" style={{ background: '#080B14', border: '1px solid #1E2535' }}>
                                <div className="text-[11px] font-semibold uppercase tracking-[1px] mb-1" style={{ color: '#4A5568' }}>Speaking Pace</div>
                                <div className="font-heading text-[36px] font-extrabold" style={{ color: '#7B61FF' }}>
                                    {report?.confidence_analysis?.pace_wpm ?? avgPace}
                                    <span className="text-[14px] font-medium" style={{ color: '#4A5568' }}> WPM</span>
                                </div>
                            </div>
                        </div>
                        {(report?.confidence_analysis?.issues?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                                {report?.confidence_analysis?.issues?.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm rounded-xl px-4 py-3" style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', color: '#FF6B6B' }}>
                                        <span>⚠️</span>
                                        <span>{issue}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── STAR Evaluation ── */}
                    {report?.star_evaluation && (
                        <div className="rounded-[20px] p-7 mt-6" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
                            <h3 className="font-heading text-[20px] font-extrabold mb-2 flex items-center gap-2">
                                ⭐ STAR Method Evaluation
                            </h3>
                            <p className="text-[13px] mb-5" style={{ color: '#8892A4' }}>
                                Overall STAR Score: <span className="font-bold" style={{ color: report.star_evaluation.star_score >= 70 ? '#4EFFA3' : report.star_evaluation.star_score >= 40 ? '#FFD166' : '#FF6B6B' }}>{report.star_evaluation.star_score}/100</span>
                            </p>
                            <div className="space-y-3">
                                {report.star_evaluation.per_question?.map((star, i) => (
                                    <div key={i} className="rounded-[14px] p-4" style={{ background: '#080B14', border: '1px solid #1E2535' }}>
                                        <div className="text-[11px] font-semibold uppercase tracking-[1px] mb-3" style={{ color: '#4A5568' }}>
                                            Question {i + 1} · STAR Score: {star.star_score}/100
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {(["situation", "task", "action", "result"] as const).map((comp) => (
                                                <div key={comp} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-[0.5px]"
                                                    style={star[comp]
                                                        ? { background: 'rgba(78,255,163,0.1)', border: '1px solid rgba(78,255,163,0.25)', color: '#4EFFA3' }
                                                        : { background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }
                                                    }
                                                >
                                                    {star[comp] ? '✔' : '✘'} {comp}
                                                </div>
                                            ))}
                                        </div>
                                        {star.missing_components?.length > 0 && (
                                            <p className="text-[12px] mt-2" style={{ color: '#8892A4' }}>
                                                Missing: {star.missing_components.join(", ")}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* ── Q&A Breakdown ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-12"
                >
                    <h2 className="font-heading text-[24px] font-extrabold mb-6 mt-12">Question-by-Question Breakdown</h2>

                    {(report?.answers ?? DEMO_ANSWERS).map((qa, i) => (
                        <div
                            key={i}
                            className="rounded-[20px] p-7 mb-4 cursor-pointer transition-all duration-200"
                            style={{ background: '#0E1220', border: '1px solid #1E2535' }}
                            onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(78,255,163,0.2)' }}
                            onMouseLeave={(e) => { (e.currentTarget).style.borderColor = '#1E2535' }}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold uppercase tracking-[1px] mb-1.5" style={{ color: '#4A5568' }}>
                                        Q{i + 1} · {qa.question_type || "Behavioral"}
                                    </div>
                                    <div className="text-base font-semibold">{qa.question_text}</div>
                                </div>
                                <div className="px-3.5 py-1 rounded-full text-[13px] font-bold whitespace-nowrap" style={{...scoreBadgeStyle(qa.score), transition: 'all 0.3s'}}>
                                    {qa.score.toFixed(1)} / 10
                                </div>
                            </div>

                            {expandedQ === i && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4"
                                >
                                    <ComparisonView 
                                        yourAnswer={qa.your_answer} 
                                        idealAnswer={qa.ideal_answer} 
                                        feedback={qa.feedback}
                                    />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* ── Tips ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="rounded-[24px] p-9 mb-12" 
                    style={{ background: '#0E1220', border: '1px solid #1E2535' }}
                >
                    <h2 className="font-heading text-[24px] font-extrabold mb-6">Personal Coaching Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tipCards.map((tip) => {
                            const style = tipStyle(tip.type)
                            const text = tip.key === "strengths"
                                ? (report?.strengths?.[0] ?? "Technical depth is excellent. You explain complex concepts clearly.")
                                : tip.key === "improvements"
                                ? (report?.improvements?.[0] ?? "Reduce filler words. Record yourself for 2 minutes daily — awareness alone reduces them 60%.")
                                : tip.custom
                            return (
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    key={tip.title} 
                                    className="rounded-[16px] p-5 border cursor-default" 
                                    style={style.card}
                                >
                                    <div className="text-[28px] mb-3">{tip.icon}</div>
                                    <h4 className="font-heading text-[15px] font-bold mb-1.5">{tip.title}</h4>
                                    <p className="text-[13px] leading-[1.6]" style={{ color: '#8892A4' }}>{text}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* ── Actions ── */}
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => router.push("/upload")} className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-sm text-black" style={{ background: '#4EFFA3' }}>
                        🔄 Retry Weak Questions
                    </button>
                    <button className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm transition-all duration-200" style={{ background: 'transparent', border: '1px solid #1E2535', color: '#E8EDF5' }}>
                        📊 View Progress Dashboard
                    </button>
                    <button className="px-8 py-3.5 rounded-xl font-heading font-semibold text-sm transition-all duration-200" style={{ background: 'transparent', border: '1px solid #1E2535', color: '#E8EDF5' }}>
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
