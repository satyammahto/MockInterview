"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Pause, ArrowRight, Loader2, Mic, SkipForward, AlertTriangle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Question {
    id: number
    text: string
    type: string
    order_index: number
}

/* ─────────────────────────────────────────────
   Voice bars heights (matched to screenshot)
───────────────────────────────────────────── */
const BAR_HEIGHTS = [14, 22, 32, 42, 50, 54, 50, 42, 32, 22, 14, 22, 36, 48, 54, 46, 34, 22, 16]

/* ─────────────────────────────────────────────
   getSupportedMimeType
───────────────────────────────────────────── */
function getSupportedMimeType(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
    for (const t of types) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t
    }
    return ""
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */

/* ── QuestionBadge ── */
function QuestionBadge({ current, total }: { current: number; total: number }) {
    return (
        <div
            className="inline-flex items-center px-4 py-1.5 rounded-full font-heading font-bold text-sm"
            style={{ background: '#4EFFA3', color: '#000' }}
        >
            Question {current} of {total}
        </div>
    )
}

/* ── TimerCircle ── */
function TimerCircle({ seconds, color }: { seconds: number; color: string }) {
    return (
        <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg"
            style={{ border: `3px solid ${color}`, color: '#E8EDF5' }}
        >
            {seconds}
        </div>
    )
}

/* ── ProgressBar ── */
function ProgressBar({ pct }: { pct: number }) {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium" style={{ color: '#8892A4' }}>Progress</span>
                <span className="text-xs font-medium" style={{ color: '#8892A4' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full w-full" style={{ background: '#1E2535' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7B61FF, #4EFFA3)' }}
                />
            </div>
        </div>
    )
}

/* ── VoiceBars ── */
function VoiceBars() {
    return (
        <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: '#4A5568' }}>
                🎙 AI Interviewer Speaking
            </p>
            <div className="flex items-end justify-center gap-[3px]" style={{ height: 56 }}>
                {BAR_HEIGHTS.map((h, i) => (
                    <div
                        key={i}
                        className="rounded-full"
                        style={{
                            width: 3,
                            height: h,
                            background: '#4EFFA3',
                            opacity: 0.85,
                            animation: `voiceAnim 0.8s ease-in-out infinite`,
                            animationDelay: `${(i % 7) * 0.08}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

/* ── QuestionCard ── */
function QuestionCard({ question, followup }: { question: Question; followup: string }) {
    return (
        <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background: '#0E1220', border: '1px solid #1E2535' }}
        >
            {/* Big decorative quote */}
            <div
                className="absolute top-0 left-4 font-heading font-black leading-none select-none pointer-events-none"
                style={{ fontSize: 120, color: 'rgba(78,255,163,0.04)', lineHeight: 1 }}
            >
                "
            </div>

            {/* Type tag */}
            <div
                className="inline-flex items-center px-3 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-[1px] mb-5"
                style={{ background: 'rgba(123,97,255,0.18)', border: '1px solid rgba(123,97,255,0.28)', color: '#7B61FF' }}
            >
                {question.type || "Behavioral"}
            </div>

            {/* Question text */}
            <h2
                className="font-heading font-bold leading-[1.35] tracking-[-0.5px] mb-6"
                style={{ fontSize: 24, color: '#E8EDF5' }}
            >
                {question.text}
            </h2>

            {/* Hint */}
            <div
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 text-[13px] leading-[1.65]"
                style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.18)', color: '#8892A4' }}
            >
                <span className="shrink-0 mt-0.5">💡</span>
                <span>
                    Try using the <strong style={{ color: '#E8EDF5' }}>STAR format</strong> — Situation, Task, Action, Result. Include specific metrics if you can.
                </span>
            </div>

            {/* Follow-up */}
            {followup && (
                <div
                    className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3.5 text-[13px] leading-[1.6]"
                    style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.2)', color: '#8892A4' }}
                >
                    <span className="shrink-0 mt-0.5 text-base">🔁</span>
                    <span><strong style={{ color: '#FFD166', fontStyle: 'normal' }}>Follow-up:</strong> {followup}</span>
                </div>
            )}
        </div>
    )
}

/* ── TranscriptCard ── */
function TranscriptCard({
    transcript,
    isTranscribing,
}: {
    transcript: string
    isTranscribing: boolean
}) {
    const hasUm = transcript.toLowerCase().includes("um") || transcript.toLowerCase().includes("uh")
    const words = transcript.split(/\s+/).filter(Boolean).length
    const isSlowPace = words > 0 && words < 30

    return (
        <div
            className="rounded-2xl p-6"
            style={{ background: '#0E1220', border: '1px solid #1E2535' }}
        >
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 flex items-center gap-2" style={{ color: '#4A5568' }}>
                📝 Your Answer (Live Transcript)
            </p>

            {isTranscribing ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#4EFFA3' }}>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing your answer...
                </div>
            ) : (
                <p className="text-[15px] leading-[1.75]" style={{ color: transcript ? '#C8D0DC' : '#4A5568' }}>
                    {transcript || "Start speaking to see your transcription here..."}
                </p>
            )}

            {/* Warning badges */}
            {transcript && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {hasUm && (
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                            style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}
                        >
                            <AlertTriangle className="w-3 h-3" /> &quot;um&quot; detected
                        </span>
                    )}
                    {isSlowPace && (
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                            style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}
                        >
                            <AlertTriangle className="w-3 h-3" /> Slow pace
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

/* ── VoiceInput (mic button) ── */
function VoiceInput({
    isRecording,
    isTranscribing,
    onToggle,
}: {
    isRecording: boolean
    isTranscribing: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={onToggle}
                disabled={isTranscribing}
                title={isRecording ? "Stop recording" : "Start recording"}
                className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40"
                style={isRecording
                    ? {
                        background: 'rgba(78,255,163,0.12)',
                        border: '2px solid #4EFFA3',
                        boxShadow: '0 0 0 0 rgba(78,255,163,0.4)',
                        animation: 'micPulse 1.5s ease-out infinite',
                    }
                    : { background: '#141926', border: '2px solid #1E2535' }
                }
            >
                <Mic
                    className="w-7 h-7"
                    style={{ color: isRecording ? '#4EFFA3' : '#8892A4' }}
                />
            </button>
            <p className="text-sm font-medium" style={{ color: isRecording ? '#4EFFA3' : '#8892A4' }}>
                {isTranscribing
                    ? "Processing..."
                    : isRecording
                    ? "Listening... speak naturally"
                    : "Click mic to start answering"}
            </p>
        </div>
    )
}

/* ── LiveMetrics (right panel card 1) ── */
function LiveMetrics() {
    const metrics = [
        { label: "Clarity", val: "7.2", color: '#4EFFA3', bar: 72 },
        { label: "Confidence", val: "5.8", color: '#FFD166', bar: 58 },
        { label: "Pace (WPM)", val: "105", color: '#FFD166', bar: null },
        { label: "Filler Words", val: "3", color: '#FF6B6B', bar: null },
        { label: "Answer Length", val: "Good", color: '#4EFFA3', bar: null },
    ]

    return (
        <div className="rounded-2xl p-6" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
            <p className="text-[11px] font-bold uppercase tracking-[2px] mb-5" style={{ color: '#4A5568' }}>
                Live Metrics
            </p>
            <div className="flex flex-col gap-3">
                {metrics.map((m) => (
                    <div key={m.label}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm" style={{ color: '#8892A4' }}>{m.label}</span>
                            <span className="font-heading font-bold text-lg" style={{ color: m.color }}>{m.val}</span>
                        </div>
                        {m.bar !== null && (
                            <div className="h-1.5 rounded-full w-full" style={{ background: '#1E2535' }}>
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${m.bar}%`, background: m.color }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── QuestionList (right panel card 2) ── */
function QuestionList({
    questions,
    currentIndex,
    onSelect,
}: {
    questions: Question[]
    currentIndex: number
    onSelect: (i: number) => void
}) {
    const visible = questions.slice(0, 5)
    const remaining = Math.max(0, questions.length - 5)

    return (
        <div className="rounded-2xl p-6" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
            <p className="text-[11px] font-bold uppercase tracking-[2px] mb-5" style={{ color: '#4A5568' }}>
                Questions
            </p>
            <div className="flex flex-col gap-1.5">
                {visible.map((q, i) => {
                    const isDone = i < currentIndex
                    const isActive = i === currentIndex
                    return (
                        <button
                            key={i}
                            onClick={() => onSelect(i)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200"
                            style={{
                                background: isActive ? 'rgba(78,255,163,0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(78,255,163,0.25)' : '1px solid transparent',
                            }}
                        >
                            <div
                                className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold shrink-0"
                                style={{
                                    background: isActive ? '#4EFFA3' : isDone ? 'rgba(78,255,163,0.2)' : '#1E2535',
                                    color: isActive ? '#000' : isDone ? '#4EFFA3' : '#8892A4',
                                }}
                            >
                                {isDone ? "✓" : i + 1}
                            </div>
                            <span
                                className="text-[13px] flex-1 truncate"
                                style={{ color: isActive ? '#E8EDF5' : isDone ? '#8892A4' : '#4A5568' }}
                            >
                                {q.text.length > 36 ? q.text.slice(0, 36) + "..." : q.text}
                            </span>
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: isActive ? '#4EFFA3' : isDone ? '#4EFFA3' : '#1E2535' }}
                            />
                        </button>
                    )
                })}
                {remaining > 0 && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div
                            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ background: '#1E2535', color: '#4A5568' }}
                        >
                            +{remaining}
                        </div>
                        <span className="text-[13px]" style={{ color: '#4A5568' }}>more questions...</span>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── SessionSummary (right panel card 3) ── */
function SessionSummary({ questionIndex, total }: { questionIndex: number; total: number }) {
    const [elapsed, setElapsed] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setElapsed((p) => p + 1), 1000)
        return () => clearInterval(t)
    }, [])
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0")
    const secs = String(elapsed % 60).padStart(2, "0")

    return (
        <div className="rounded-2xl p-6" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
            <p className="text-[11px] font-bold uppercase tracking-[2px] mb-5" style={{ color: '#4A5568' }}>
                Session
            </p>
            {[
                { label: "Time Elapsed", val: `${mins}:${secs}`, color: '#E8EDF5' },
                { label: "Avg Score", val: "—", color: '#4EFFA3' },
                { label: "Total Umms", val: "0", color: '#FF6B6B' },
            ].map((s) => (
                <div
                    key={s.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid #1E2535' }}
                >
                    <span className="text-sm" style={{ color: '#8892A4' }}>{s.label}</span>
                    <span className="font-heading font-bold text-lg" style={{ color: s.color }}>{s.val}</span>
                </div>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════
   DEMO QUESTIONS (shown when no session)
═══════════════════════════════════════════ */
const DEMO_QUESTIONS: Question[] = [
    { id: 1, text: "Tell me about yourself", type: "HR", order_index: 0 },
    { id: 2, text: "Why this company?", type: "HR", order_index: 1 },
    { id: 3, text: "You mentioned building a payment gateway at XYZ Startup in your resume. Walk me through a specific technical failure you encountered and exactly how you resolved it.", type: "Behavioral", order_index: 2 },
    { id: 4, text: "System design: Design a URL shortener like bit.ly", type: "Technical", order_index: 3 },
    { id: 5, text: "Biggest weakness?", type: "HR", order_index: 4 },
    { id: 6, text: "Where do you see yourself in 5 years?", type: "HR", order_index: 5 },
    { id: 7, text: "Describe a time you had a conflict with a teammate.", type: "Behavioral", order_index: 6 },
    { id: 8, text: "How do you handle tight deadlines?", type: "Behavioral", order_index: 7 },
    { id: 9, text: "What is your greatest professional achievement?", type: "HR", order_index: 8 },
    { id: 10, text: "Do you have any questions for us?", type: "HR", order_index: 9 },
]

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function InterviewPage() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [questionIndex, setQuestionIndex] = useState(2) // default to Q3 for demo
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [timeRemaining, setTimeRemaining] = useState(31)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [followup, setFollowup] = useState("")
    const [error, setError] = useState("")

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    /* ── Load session from localStorage ── */
    useEffect(() => {
        setMounted(true)
        const sid = localStorage.getItem("prepsense_session_id") || ""
        const raw = localStorage.getItem("prepsense_questions")
        const qs: Question[] = raw ? JSON.parse(raw) : []

        if (sid && qs.length > 0) {
            setSessionId(sid)
            setQuestions(qs)
            setQuestionIndex(0)
            setTimeRemaining(90)
        } else {
            // No real session — use demo data so the UI is always visible
            setQuestions(DEMO_QUESTIONS)
            setQuestionIndex(2)
            setTimeRemaining(31)
        }
    }, [])

    const currentQ = questions[questionIndex] ?? DEMO_QUESTIONS[2]

    /* ── stopRecording (defined early so timer effect can reference it) ── */
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
    }, [])

    /* ── Timer ── */
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>
        if (isRecording && timeRemaining > 0) {
            timer = setInterval(() => setTimeRemaining((p) => p - 1), 1000)
        } else if (timeRemaining === 0 && isRecording) {
            stopRecording()
        }
        return () => clearInterval(timer)
    }, [isRecording, timeRemaining, stopRecording])

    const timerColor = timeRemaining <= 15 ? '#FF6B6B' : timeRemaining <= 30 ? '#FFD166' : '#4EFFA3'
    const progress = questions.length > 0
        ? Math.round(((questionIndex + 1) / questions.length) * 100)
        : 30

    /* ── transcribeAudio ── */
    const transcribeAudio = async (blob: Blob) => {
        setIsTranscribing(true)
        try {
            const fd = new FormData()
            const ext = blob.type.includes("mp4") ? "mp4" : "webm"
            fd.append("audio", blob, `answer.${ext}`)
            const res = await fetch(`${API_BASE}/transcribe`, { method: "POST", body: fd })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setTranscript(data.transcript || "")
        } catch {
            setError("Transcription failed. Check backend is running.")
        } finally {
            setIsTranscribing(false)
        }
    }

    /* ── startRecording ── */
    const startRecording = async () => {
        setError("")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mimeType = getSupportedMimeType()
            const mr = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream)
            mediaRecorderRef.current = mr
            audioChunksRef.current = []
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            mr.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop())
                const type = mimeType || "audio/webm"
                const blob = new Blob(audioChunksRef.current, { type })
                await transcribeAudio(blob)
            }
            mr.start()
            setIsRecording(true)
            setTranscript("")
            setFollowup("")
        } catch {
            setError("Microphone access denied. Allow permissions and try again.")
        }
    }

    const toggleMic = () => {
        if (isRecording) stopRecording()
        else startRecording()
    }

    /* ── handleNext ── */
    const handleNext = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        try {
            if (sessionId && transcript) {
                const res = await fetch(`${API_BASE}/sessions/${sessionId}/answers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question_id: currentQ.id,
                        transcript,
                        time_taken_seconds: 90 - timeRemaining,
                    }),
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.followup_question) { setFollowup(data.followup_question); setIsSubmitting(false); return }
                }
            }
            advance()
        } catch {
            setError("Could not submit. Check backend connection.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const advance = () => {
        if (questionIndex >= questions.length - 1) {
            if (sessionId) {
                fetch(`${API_BASE}/sessions/${sessionId}/generate-report`, { method: "POST" }).catch(() => {})
            }
            router.push("/report")
        } else {
            setQuestionIndex((p) => p + 1)
            setTranscript("")
            setFollowup("")
            setTimeRemaining(90)
            setIsRecording(false)
        }
    }

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: '#080B14' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4EFFA3' }} />
            </div>
        )
    }

    return (
        <div
            className="w-full min-h-[calc(100vh-68px)]"
            style={{ background: '#080B14', color: '#E8EDF5' }}
        >
            {/* ════════ MAIN GRID ════════ */}
            <div
                className="grid h-full"
                style={{
                    gridTemplateColumns: '1fr 360px',
                    minHeight: 'calc(100vh - 68px)',
                }}
            >
                {/* ══ LEFT PANEL ══ */}
                <div
                    className="flex flex-col gap-5 p-10 overflow-y-auto"
                    style={{ borderRight: '1px solid #1E2535' }}
                >
                    {/* Top row: badge + pause + timer */}
                    <div className="flex items-center justify-between">
                        <QuestionBadge current={questionIndex + 1} total={questions.length} />
                        <div className="flex items-center gap-3">
                            <button
                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                                style={{ background: '#141926', border: '1px solid #1E2535' }}
                                title="Pause"
                            >
                                <Pause className="w-4 h-4" style={{ color: '#8892A4' }} />
                            </button>
                            <TimerCircle seconds={timeRemaining} color={timerColor} />
                        </div>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar pct={progress} />

                    {/* Voice visualizer */}
                    <VoiceBars />

                    {/* Question card */}
                    <QuestionCard question={currentQ} followup={followup} />

                    {/* Transcript */}
                    <TranscriptCard transcript={transcript} isTranscribing={isTranscribing} />

                    {/* Mic input */}
                    <VoiceInput
                        isRecording={isRecording}
                        isTranscribing={isTranscribing}
                        onToggle={toggleMic}
                    />

                    {/* Error */}
                    {error && (
                        <div
                            className="rounded-xl px-4 py-3 text-sm text-center"
                            style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Bottom actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={advance}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                            style={{ background: 'transparent', border: '1px solid #1E2535', color: '#8892A4' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8892A4'; e.currentTarget.style.color = '#E8EDF5' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1E2535'; e.currentTarget.style.color = '#8892A4' }}
                        >
                            Skip Question
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting || isRecording || isTranscribing}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-heading font-bold text-sm text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                            style={{ background: '#4EFFA3' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(78,255,163,0.35)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                        >
                            {isSubmitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                : <>{questionIndex >= questions.length - 1 ? "Finish Interview" : "Submit & Next"} <ArrowRight className="w-4 h-4" /></>
                            }
                        </button>
                    </div>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div
                    className="flex flex-col gap-5 p-6 overflow-y-auto"
                    style={{ background: '#060810' }}
                >
                    <LiveMetrics />
                    <QuestionList
                        questions={questions}
                        currentIndex={questionIndex}
                        onSelect={(i) => {
                            if (!isRecording && !isSubmitting) {
                                setQuestionIndex(i)
                                setTranscript("")
                                setFollowup("")
                                setTimeRemaining(90)
                            }
                        }}
                    />
                    <SessionSummary questionIndex={questionIndex} total={questions.length} />
                </div>
            </div>
        </div>
    )
}
