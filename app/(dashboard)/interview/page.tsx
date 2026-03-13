"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, ArrowRight, Loader2, Activity, MessageSquare, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Question {
    id: number
    text: string
    type: string
    order_index: number
}

export default function InterviewPage() {
    const router = useRouter()
    const [sessionId, setSessionId] = useState<string>("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [questionIndex, setQuestionIndex] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [timeRemaining, setTimeRemaining] = useState(120)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [followupQuestion, setFollowupQuestion] = useState("")
    const [error, setError] = useState("")

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    useEffect(() => {
        const sid = localStorage.getItem("prepsense_session_id") || ""
        const qs: Question[] = JSON.parse(localStorage.getItem("prepsense_questions") || "[]")
        if (!sid || qs.length === 0) {
            router.replace("/upload")
            return
        }
        setSessionId(sid)
        setQuestions(qs)
    }, [router])

    const currentQ = questions[questionIndex]

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording && timeRemaining > 0) {
            interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000)
        } else if (timeRemaining === 0 && isRecording) {
            stopRecording()
        }
        return () => clearInterval(interval)
    }, [isRecording, timeRemaining])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop())
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                await transcribeAudio(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
            setTranscript("")
            setFollowupQuestion("")
            setError("")
        } catch {
            setError("Microphone access denied. Please allow microphone permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const toggleRecording = () => {
        if (isRecording) stopRecording()
        else startRecording()
    }

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true)
        try {
            const formData = new FormData()
            formData.append("audio", audioBlob, "recording.webm")
            const res = await fetch(`${API_BASE}/transcribe`, { method: "POST", body: formData })
            if (!res.ok) throw new Error("Transcription failed")
            const data = await res.json()
            setTranscript(data.transcript || "")
        } catch {
            setError("Transcription failed. Please try recording again.")
        } finally {
            setIsTranscribing(false)
        }
    }

    const handleNext = async () => {
        if (!currentQ) return
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/sessions/${sessionId}/answers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question_id: currentQ.id,
                    transcript,
                    time_taken_seconds: 120 - timeRemaining,
                }),
            })
            if (res.ok) {
                const data = await res.json()
                if (data.followup_question) setFollowupQuestion(data.followup_question)
            }

            if (questionIndex >= questions.length - 1) {
                await fetch(`${API_BASE}/sessions/${sessionId}/generate-report`, { method: "POST" })
                router.push("/report")
            } else {
                setQuestionIndex((prev) => prev + 1)
                setTranscript("")
                setFollowupQuestion("")
                setTimeRemaining(120)
                setIsRecording(false)
            }
        } catch {
            setError("Failed to submit answer. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const mins = Math.floor(timeRemaining / 60)
    const secs = timeRemaining % 60
    const timeString = `${mins}:${secs.toString().padStart(2, "0")}`
    const progressPercentage = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0

    if (!currentQ) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] border-t border-border/50 mt-[-2rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-background to-[#020305]">

            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface z-50">
                <div
                    className="h-full bg-accent shadow-[0_0_10px_rgba(78,255,163,0.5)] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Left Stage: AI Interview */}
            <div className="flex-[2] p-6 md:p-12 flex flex-col items-center justify-center relative min-h-[500px]">

                {/* Status bar */}
                <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3 bg-surface/80 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full shadow-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent-1)]" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {isRecording ? "Listening" : isTranscribing ? "Transcribing" : "System Ready"}
                        </span>
                    </div>
                    <div className="font-heading font-extrabold text-xl tabular-nums tracking-widest">
                        <span className={timeRemaining <= 10 ? "text-destructive" : "text-foreground"}>{timeString}</span>
                    </div>
                </div>

                {/* AI Question Card */}
                <div className="w-full max-w-3xl bg-surface/40 backdrop-blur-2xl border border-border/60 rounded-[32px] p-10 md:p-16 relative overflow-hidden shadow-2xl mb-12 hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5" />
                    <div className="absolute -top-10 -left-6 text-[180px] leading-none font-black text-white/5 pointer-events-none select-none font-heading blur-sm">
                        &quot;
                    </div>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-2/10 text-accent-2 text-[10px] font-bold uppercase tracking-widest rounded-md mb-8 border border-accent-2/20">
                            {currentQ.type}
                        </div>
                        <h2 className="font-heading text-3xl md:text-5xl font-extrabold leading-[1.2] tracking-tight text-foreground animate-in slide-in-from-bottom-4">
                            {currentQ.text}
                        </h2>
                        {followupQuestion && (
                            <div className="mt-6 bg-[var(--accent-2)]/5 border border-[var(--accent-2)]/20 rounded-xl px-6 py-4 text-sm text-[var(--accent-2)] font-medium animate-in fade-in duration-300">
                                <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-2)]/60 block mb-1">Follow-up</span>
                                {followupQuestion}
                            </div>
                        )}
                    </div>
                </div>

                {/* Audio Visualizer */}
                <div className="flex items-center gap-1.5 h-20 justify-center mb-16 opacity-90 mix-blend-screen w-full max-w-md mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                        <div
                            key={i}
                            className={cn("w-2 rounded-full transition-all duration-300", !isRecording ? "h-2 bg-muted-foreground/30" : "bg-accent")}
                            style={isRecording ? {
                                animation: `voiceAnim ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                                animationDelay: `${i * 0.1}s`,
                                height: `${20 + Math.random() * 60}px`
                            } : {}}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 w-full max-w-lg">
                        {error}
                    </div>
                )}

                {/* Recording Button */}
                <div className="mt-auto flex flex-col items-center gap-5 relative z-10">
                    {isTranscribing ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-accent" />
                            <span className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Transcribing...</span>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={toggleRecording}
                                className={cn(
                                    "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-4 transition-all duration-300 group shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden",
                                    isRecording
                                        ? "bg-destructive/10 border-destructive shadow-[0_0_30px_rgba(255,107,107,0.3)] hover:scale-95"
                                        : "bg-surface border-accent hover:bg-accent/10 hover:shadow-[0_0_40px_rgba(78,255,163,0.3)] hover:scale-105"
                                )}
                            >
                                {isRecording && <div className="absolute inset-0 bg-destructive/20 animate-ping rounded-full" />}
                                {isRecording ? (
                                    <Square className="w-8 h-8 sm:w-10 sm:h-10 text-destructive fill-destructive" />
                                ) : (
                                    <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                                )}
                            </button>
                            <span className="text-sm font-bold text-muted-foreground tracking-wide uppercase">
                                {isRecording ? "Tap to Stop" : "Tap to Answer"}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Right Sidebar: Live Metrics & Transcript */}
            <div className="flex-1 lg:max-w-md bg-surface/30 backdrop-blur-xl border-l border-border/50 p-6 flex flex-col relative z-20">

                {/* Live Metrics */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Live Session Metrics</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/40 border border-border/50 rounded-xl p-4 flex flex-col justify-between h-24 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-2/10 blur-xl rounded-full" />
                            <Activity className="w-4 h-4 text-accent-2" />
                            <div>
                                <div className="text-xl font-heading font-bold">Good</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Pacing</div>
                            </div>
                        </div>
                        <div className="bg-background/40 border border-border/50 rounded-xl p-4 flex flex-col justify-between h-24 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 blur-xl rounded-full" />
                            <MessageSquare className="w-4 h-4 text-accent" />
                            <div>
                                <div className="text-xl font-heading font-bold text-accent">92%</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Clarity</div>
                            </div>
                        </div>
                        <div className="col-span-2 bg-background/40 border border-border/50 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-accent-4" />
                                <span className="text-sm font-semibold">Filler Words</span>
                            </div>
                            <span className="font-heading font-bold text-lg">2 detected</span>
                        </div>
                    </div>
                </div>

                {/* Live Transcript */}
                <div className="flex-1 flex flex-col min-h-[250px] bg-background/40 border border-border/50 rounded-2xl overflow-hidden shadow-inner">
                    <div className="p-4 border-b border-border/50 bg-surface/50 backdrop-blur-md flex items-center sticky top-0 z-10">
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isRecording ? "bg-accent animate-pulse" : "bg-muted-foreground")} />
                            Live Transcript
                        </span>
                    </div>
                    <div className="p-5 overflow-y-auto flex-1 font-body text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                        {!transcript && !isRecording && !isTranscribing ? (
                            <p className="text-muted-foreground italic mt-4 text-center text-xs">Awaiting vocal response...</p>
                        ) : (
                            <>
                                <p className="animate-in fade-in duration-300">{transcript}</p>
                                {(isRecording || isTranscribing) && <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle rounded-sm" />}
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 mt-6 border-t border-border/50 shrink-0 flex items-center justify-between gap-4">
                    <button
                        onClick={() => handleNext()}
                        disabled={isSubmitting}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest border-b border-transparent hover:border-foreground pb-0.5 disabled:opacity-50"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || isRecording || isTranscribing}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold bg-accent text-black hover:bg-accent/90 transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(78,255,163,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                        ) : questionIndex >= questions.length - 1 ? (
                            <>Finish Interview <ArrowRight className="w-4 h-4" /></>
                        ) : (
                            <>Next Question <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
