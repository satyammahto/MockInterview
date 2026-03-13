"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, Square, ArrowRight, Loader2, Volume2 } from "lucide-react"
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

    // MediaRecorder refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    // Load session data from localStorage on mount
    useEffect(() => {
        const sid = localStorage.getItem("prepsense_session_id") || ""
        const qs: Question[] = JSON.parse(localStorage.getItem("prepsense_questions") || "[]")

        if (!sid || qs.length === 0) {
            // No session started — redirect to upload
            router.replace("/upload")
            return
        }
        setSessionId(sid)
        setQuestions(qs)
    }, [router])

    const currentQ = questions[questionIndex]

    // ─── Timer ────────────────────────────────────────────────────────────────
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording && timeRemaining > 0) {
            interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000)
        } else if (timeRemaining === 0 && isRecording) {
            stopRecording()
        }
        return () => clearInterval(interval)
    }, [isRecording, timeRemaining])

    // ─── Recording Controls ────────────────────────────────────────────────────
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
        } catch (err) {
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

    // ─── Whisper STT ──────────────────────────────────────────────────────────
    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true)
        try {
            const formData = new FormData()
            formData.append("audio", audioBlob, "recording.webm")

            const res = await fetch(`${API_BASE}/transcribe`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Transcription failed")
            const data = await res.json()
            setTranscript(data.transcript || "")
        } catch (err) {
            setError("Transcription failed. Please try recording again.")
        } finally {
            setIsTranscribing(false)
        }
    }

    // ─── Submit Answer & Move Next ─────────────────────────────────────────────
    const handleNext = async () => {
        if (!currentQ) return
        setIsSubmitting(true)

        try {
            // Submit answer to backend
            const res = await fetch(`${API_BASE}/sessions/${sessionId}/answers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question_id: currentQ.id,
                    transcript: transcript,
                    time_taken_seconds: 120 - timeRemaining,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data.followup_question) {
                    setFollowupQuestion(data.followup_question)
                }
            }

            // Last question → generate report and redirect
            if (questionIndex >= questions.length - 1) {
                const reportRes = await fetch(`${API_BASE}/sessions/${sessionId}/generate-report`, {
                    method: "POST",
                })
                if (reportRes.ok) {
                    router.push("/report")
                } else {
                    router.push("/report") // Still redirect even if report generation failed
                }
            } else {
                // Advance to next question
                setQuestionIndex((prev) => prev + 1)
                setTranscript("")
                setFollowupQuestion("")
                setTimeRemaining(120)
                setIsRecording(false)
            }
        } catch (err) {
            setError("Failed to submit answer. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Format Timer ──────────────────────────────────────────────────────────
    const mins = Math.floor(timeRemaining / 60)
    const secs = timeRemaining % 60
    const timeString = `${mins}:${secs.toString().padStart(2, "0")}`

    if (!currentQ) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] border-t border-border mt-[-2rem]">
            {/* Main Stage */}
            <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center relative min-h-[500px]">

                {/* Top bar */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-accent/10 border border-accent/20 text-accent font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                            Question {questionIndex + 1}/{questions.length}
                        </span>
                    </div>
                    <div className="font-heading font-extrabold text-2xl tabular-nums flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full border-2 border-accent flex items-center justify-center text-sm transition-all duration-300",
                            isRecording && "animate-pulse shadow-[0_0_15px_var(--accent-1)]"
                        )}>
                            {timeRemaining < 10 ? <span className="text-destructive font-bold">{secs}</span> : timeString}
                        </div>
                    </div>
                </div>

                {/* Question Display */}
                <div className="max-w-3xl w-full text-center mt-12 mb-8 relative">
                    <div className="absolute -top-12 left-0 right-0 text-[120px] leading-none font-black text-muted/10 -z-10 pointer-events-none select-none font-heading text-center">
                        &quot;
                    </div>
                    <div className="inline-block px-3 py-1 bg-[var(--accent-2)]/10 text-[var(--accent-2)] text-xs font-bold uppercase tracking-wider rounded-md mb-6 border border-[var(--accent-2)]/20 shadow-sm shadow-[var(--accent-2)]/5">
                        {currentQ.type}
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl font-extrabold leading-[1.2] tracking-tight text-foreground transition-all duration-500 animate-in slide-in-from-bottom-4">
                        {currentQ.text}
                    </h2>

                    {/* Follow-up question */}
                    {followupQuestion && (
                        <div className="mt-6 bg-[var(--accent-2)]/5 border border-[var(--accent-2)]/20 rounded-xl px-6 py-4 text-sm text-[var(--accent-2)] font-medium animate-in fade-in duration-300">
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-2)]/60 block mb-1">Follow-up</span>
                            {followupQuestion}
                        </div>
                    )}
                </div>

                {/* AI Audio Visualizer */}
                <div className="flex items-center gap-1.5 h-16 justify-center mb-8 opacity-80 mix-blend-screen">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1.5 rounded-full",
                                !isRecording ? "h-2 bg-muted-foreground/30 transition-all duration-[2000ms]" :
                                    "bg-accent animate-[voiceAnim_0.8s_ease-in-out_infinite]"
                            )}
                            style={isRecording ? { animationDelay: `${i * 0.15}s`, height: `${20 + Math.random() * 40}px` } : {}}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Recording Controls */}
                <div className="mt-auto flex flex-col items-center gap-4">
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
                                    "relative w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 group shadow-2xl overflow-hidden",
                                    isRecording
                                        ? "bg-destructive/10 border-destructive hover:bg-destructive/20"
                                        : "bg-surface border-border hover:border-accent hover:bg-accent/5 hover:scale-105"
                                )}
                            >
                                {isRecording && (
                                    <div className="absolute inset-0 bg-destructive/20 animate-ping rounded-full" />
                                )}
                                {isRecording ? (
                                    <Square className="w-8 h-8 text-destructive fill-destructive transition-transform group-hover:scale-90" />
                                ) : (
                                    <Mic className="w-8 h-8 text-foreground transition-transform group-hover:scale-110" />
                                )}
                            </button>
                            <span className="text-sm font-bold text-muted-foreground tracking-wide uppercase">
                                {isRecording ? "Tap to Stop" : "Tap to Answer"}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar (Transcript & Next) */}
            <div className="lg:w-96 bg-surface/50 border-l border-border p-6 flex flex-col overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none z-10" />

                <div className="flex-1 overflow-y-auto pb-20 pr-2 custom-scrollbar">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Live Transcript
                    </h3>

                    <div className="bg-surface border border-border rounded-xl p-5 min-h-[200px] shadow-inner font-body text-sm leading-relaxed text-foreground whitespace-pre-wrap transition-all relative overflow-hidden group">
                        {!transcript && !isRecording && !isTranscribing && (
                            <p className="text-muted-foreground italic text-center absolute inset-0 flex items-center justify-center">Awaiting response...</p>
                        )}
                        <p className={cn("transition-opacity duration-300", !transcript ? "opacity-0" : "opacity-100")}>
                            {transcript}
                        </p>
                        {(isRecording || isTranscribing) && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle rounded-sm" />
                        )}
                    </div>
                </div>

                {/* Action Panel */}
                <div className="pt-6 border-t border-border shrink-0 z-20 bg-surface/50 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => handleNext()}
                            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider px-4 py-2 border border-transparent hover:border-border rounded-lg"
                            disabled={isSubmitting}
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting || isRecording || isTranscribing}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold bg-accent text-black hover:bg-accent/90 transition-transform hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(78,255,163,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
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
        </div>
    )
}
