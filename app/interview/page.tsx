"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Pause } from "lucide-react"
import { useInterviewStore } from "@/store/interviewStore"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { PageContainer } from "@/components/layout/PageContainer"

// New components
import { VoiceRecorder } from "@/components/interview/VoiceRecorder"
import { AIAvatar } from "@/components/interview/AIAvatar"
import { TranscriptPanel } from "@/components/interview/TranscriptPanel"
import { CoachingPrompt } from "@/components/interview/CoachingPrompt"
import { AnswerEvaluationCard } from "@/components/interview/AnswerEvaluationCard"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function InterviewPage() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(90)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [followup, setFollowup] = useState("")
    const [error, setError] = useState("")
    const [evaluation, setEvaluation] = useState<any>(null)
    const [isEvaluating, setIsEvaluating] = useState(false)

    // Global state
    const { 
        sessionId, 
        questions, 
        currentQuestionIndex, 
        setSession, 
        setCurrentQuestion,
        setIsAISpeaking 
    } = useInterviewStore()

    // Hooks
    const { isRecording, startRecording, stopRecording, audioLevel } = useVoiceRecorder()
    const { speak, stop, isSpeaking } = useSpeechSynthesis()
    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported: sttSupported,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechToText()

    // Sync AI speaking state to store for the Avatar
    useEffect(() => {
        setIsAISpeaking(isSpeaking)
    }, [isSpeaking, setIsAISpeaking])

    // On mount check session
    useEffect(() => {
        setMounted(true)
        const sid = localStorage.getItem("prepsense_session_id")
        const rawQs = localStorage.getItem("prepsense_questions")
        
        if (sid && rawQs) {
            setSession(sid, JSON.parse(rawQs))
            setTimeRemaining(90)
        } else {
            // Load demo data
            setSession("demo-session", [
                { id: 1, text: "Tell me about yourself.", type: "HR", order_index: 0 },
                { id: 2, text: "Why this company?", type: "HR", order_index: 1 },
                { id: 3, text: "Describe a time you solved a complex problem.", type: "Behavioral", order_index: 2 }
            ])
        }
    }, [setSession])

    const currentQ = questions[currentQuestionIndex]

    // Read question out loud when it changes (and not doing setup)
    useEffect(() => {
        if (mounted && currentQ && !followup) {
            // Slight delay so the UI fully renders before speaking
            const t = setTimeout(() => {
                speak(currentQ.text)
            }, 800)
            return () => clearTimeout(t)
        }
    }, [currentQ, mounted, speak, followup])

    // Speak followup when it arrives
    useEffect(() => {
        if (followup) {
            speak(followup)
        }
    }, [followup, speak])

    // Timer logic
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>
        if (isRecording && timeRemaining > 0) {
            timer = setInterval(() => setTimeRemaining(p => p - 1), 1000)
        } else if (timeRemaining === 0 && isRecording) {
            handleMicToggle() // Auto stop at 0
        }
        return () => clearInterval(timer)
    }, [isRecording, timeRemaining])

    const triggerEvaluation = async (text: string) => {
        if (!text || text.length < 20 || !sessionId) return;
        
        setIsEvaluating(true);
        setEvaluation(null);
        
        try {
            const res = await fetch(`${API_BASE}/sessions/evaluate-answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    question: currentQ.text,
                    user_answer: text,
                    interview_mode: "mixed", // Static for now or load from session
                    role: "Software Engineer",
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setEvaluation(data);
            }
        } catch (err) {
            console.error("Evaluation failed:", err);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleMicToggle = async () => {
        if (isRecording) {
            stopRecording()
            stopListening()
            
            // Trigger evaluation slightly after stopping to ensure transcript is stable
            setTimeout(() => {
                if (transcript) triggerEvaluation(transcript);
            }, 500);
        } else {
            // Stop any TTS first
            stop()
            setEvaluation(null)
            resetTranscript()
            setError("")
            await startRecording()
            startListening()
        }
    }

    const handleNext = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

        // Make sure recording is stopped
        if (isRecording) {
            stopRecording()
            stopListening()
        }
        
        try {
            if (sessionId !== "demo-session" && transcript) {
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
                    if (data.followup_question) {
                        setFollowup(data.followup_question)
                        setIsSubmitting(false)
                        return
                    }
                }
            }

            if (currentQuestionIndex >= questions.length - 1) {
                if (sessionId !== "demo-session") {
                    fetch(`${API_BASE}/sessions/${sessionId}/generate-report`, { method: "POST" }).catch(() => {})
                }
                router.push("/report")
            } else {
                setCurrentQuestion(currentQuestionIndex + 1)
                resetTranscript()
                setEvaluation(null)
                setFollowup("")
                setTimeRemaining(90)
                if (isRecording) stopRecording()
            }
        } catch (e) {
            setError("Could not submit answer. Try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!mounted || !currentQ) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-68px)] bg-[#080B14]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4EFFA3]" />
            </div>
        )
    }

    const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
    const isSlow = transcript.split(" ").length < 15 && transcript.length > 0 && !isListening

    return (
        <div className="min-h-[calc(100vh-68px)] flex flex-col pt-8">
            <PageContainer maxWidth="standard" className="flex-1 flex flex-col gap-8">
                
                {/* ══ HEADER ══ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center px-3 py-1 rounded-full font-heading font-bold text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            Session Progress: {currentQuestionIndex + 1} / {questions.length}
                        </div>
                        <h1 className="text-xl font-bold">Interviewing for {sessionId === "demo-session" ? "Software Engineer" : "Your Role"}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Timer */}
                        <div className="flex items-center gap-4 bg-card border border-border px-5 py-2.5 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-black text-xl border-[3px]"
                                 style={{ 
                                     borderColor: timeRemaining <= 15 ? 'var(--accent-3)' : timeRemaining <= 30 ? 'var(--accent-2)' : 'var(--primary)',
                                     color: timeRemaining <= 15 ? 'var(--accent-3)' : timeRemaining <= 30 ? 'var(--accent-2)' : 'var(--primary)'
                                 }}>
                                {timeRemaining}
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Time Left</div>
                                <div className="text-xs font-bold">{timeRemaining} Seconds</div>
                            </div>
                        </div>

                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-card border border-border transition-all hover:bg-muted shadow-sm active:scale-95">
                            <Pause className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>

                {/* ══ INTERVIEW HUD ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--section-gap)] items-start">
                    
                    {/* Left/Center: Question & Avatar */}
                    <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                        
                        {/* Interaction Zone (Avatar + Question) */}
                        <div className="bg-card border border-border rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                            <AIAvatar isSpeaking={isSpeaking} isProcessing={isSubmitting} />
                            
                            <div className="mt-10 max-w-2xl mx-auto">
                                <div className="inline-flex items-center px-3 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-[1px] mb-6 bg-primary/10 border border-primary/20 text-primary">
                                    {currentQ.type || "Behavioral"}
                                </div>
                                
                                <h2 className="font-heading font-extrabold leading-[1.3] text-2xl md:text-3xl tracking-tight mb-8">
                                    "{currentQ.text}"
                                </h2>

                                {followup && (
                                    <div className="inline-flex items-start gap-3 rounded-2xl px-5 py-4 text-sm leading-relaxed bg-accent/5 border border-accent/10 text-muted-foreground text-left max-w-lg mx-auto animate-in slide-in-from-top-2">
                                        <span className="text-lg">🔁</span>
                                        <span><strong className="text-foreground font-bold italic">Follow-up:</strong> {followup}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LIVE FEEDBACK CARD */}
                        {(isEvaluating || evaluation) && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <AnswerEvaluationCard 
                                    evaluation={evaluation} 
                                    loading={isEvaluating} 
                                />
                            </div>
                        )}

                        {/* Controls Bar */}
                        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                            <button
                                onClick={() => handleNext()}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold transition-all px-4 py-2 rounded-xl hover:bg-muted"
                                disabled={isSubmitting}
                            >
                                Skip Question
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <VoiceRecorder 
                                    isRecording={isRecording}
                                    audioLevel={audioLevel}
                                    onToggle={handleMicToggle}
                                    disabled={isSpeaking}
                                />

                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting || isRecording}
                                    className="flex items-center gap-2 px-8 h-12 rounded-xl font-heading font-black text-sm text-primary-foreground bg-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting 
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</>
                                        : <>{currentQuestionIndex >= questions.length - 1 ? "Complete Interview" : "Next Question"} <ArrowRight className="w-4 h-4" /></>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right/Bottom: Sidebar (Transcript/Coaching) */}
                    <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 h-full">
                        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[400px] xl:min-h-full">
                            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Live Transcript</h3>
                                {isListening && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> <span className="text-[10px] font-bold">Listening</span></div>}
                            </div>
                            <div className="flex-1">
                                <TranscriptPanel
                                    transcript={transcript}
                                    interimTranscript={interimTranscript}
                                    isProcessing={isListening}
                                />
                            </div>
                            {!sttSupported && (
                                <div className="px-6 py-4 bg-accent/5 border-t border-accent/10">
                                    <p className="text-[10px] leading-relaxed text-accent font-medium">⚠️ Live transcription is not supported in this browser. Try Chrome for the best experience.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-4 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 backdrop-blur-xl animate-in slide-in-from-bottom-5">
                        {error}
                    </div>
                )}
            </PageContainer>

            {/* Coaching-Prompt-Overlay already handled by standard PageContainer padding/spacing */}
            <CoachingPrompt 
                tip={isSlow ? "You're speaking a bit slowly. Try to slightly pick up the pace and sound confident." : null} 
            />
        </div>
    )
}
