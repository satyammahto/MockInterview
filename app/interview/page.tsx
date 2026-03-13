"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Pause } from "lucide-react"
import { useInterviewStore } from "@/store/interviewStore"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis"
import { useSpeechToText } from "@/hooks/useSpeechToText"

// New components
import { VoiceRecorder } from "@/components/interview/VoiceRecorder"
import { AIAvatar } from "@/components/interview/AIAvatar"
import { TranscriptPanel } from "@/components/interview/TranscriptPanel"
import { CoachingPrompt } from "@/components/interview/CoachingPrompt"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function InterviewPage() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(90)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [followup, setFollowup] = useState("")
    const [error, setError] = useState("")

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

    const handleMicToggle = async () => {
        if (isRecording) {
            stopRecording()
            stopListening()
        } else {
            // Stop any TTS first
            stop()
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
        <div className="w-full min-h-[calc(100vh-68px)] bg-[#080B14] text-[#E8EDF5]">
            <div className="grid h-full" style={{ gridTemplateColumns: '1fr 380px', minHeight: 'calc(100vh - 68px)' }}>
                
                {/* ══ LEFT PANEL ══ */}
                <div className="flex flex-col gap-6 p-10 overflow-y-auto border-r border-[#1E2535]">
                    
                    {/* Header: Progress & Timer */}
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full font-heading font-bold text-sm bg-[#4EFFA3] text-black">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#141926] border border-[#1E2535] transition-colors hover:bg-white/5">
                                <Pause className="w-4 h-4 text-[#8892A4]" />
                            </button>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg border-[3px]"
                                 style={{ borderColor: timeRemaining <= 15 ? '#FF6B6B' : timeRemaining <= 30 ? '#FFD166' : '#4EFFA3' }}>
                                {timeRemaining}
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-[#8892A4]">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full w-full bg-[#1E2535]">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#4EFFA3] transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {/* AI Avatar */}
                    <AIAvatar isSpeaking={isSpeaking} isProcessing={isSubmitting} />

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl px-4 py-3 text-sm text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20">
                            {error}
                        </div>
                    )}

                    {/* Question Card */}
                    <div className="rounded-3xl p-8 relative overflow-hidden bg-[#0E1220] border border-[#1E2535]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="inline-flex items-center px-3 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-[1px] mb-5 bg-[#7B61FF]/10 border border-[#7B61FF]/20 text-[#7B61FF]">
                            {currentQ.type || "Behavioral"}
                        </div>
                        
                        <h2 className="font-heading font-bold leading-[1.35] tracking-tight mb-6 text-2xl text-[#E8EDF5]">
                            {currentQ.text}
                        </h2>

                        {followup && (
                            <div className="mt-4 flex items-start gap-3 rounded-xl px-4 py-4 text-sm leading-relaxed bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#8892A4]">
                                <span className="text-lg">🔁</span>
                                <span><strong className="text-[#FFD166] font-normal">Follow-up:</strong> {followup}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 mt-auto">
                        <button
                            onClick={() => handleNext()}
                            className="text-[#8892A4] hover:text-[#E8EDF5] text-sm font-semibold transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Skip
                        </button>
                        
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting || isRecording}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-[15px] text-black bg-[#4EFFA3] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(78,255,163,0.25)]"
                        >
                            {isSubmitting 
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</>
                                : <>{currentQuestionIndex >= questions.length - 1 ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" /></>
                            }
                        </button>
                    </div>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div className="flex flex-col gap-5 p-6 bg-[#060810] border-l border-[#1E2535]/50 overflow-y-auto relative">
                    {!sttSupported && (
                        <div className="rounded-xl px-4 py-3 text-xs text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/20">
                            ⚠️ Live transcription is not supported in this browser. Try Chrome or Edge.
                        </div>
                    )}
                    {/* Transcript Panel takes top half */}
                    <div className="h-[40vh] min-h-[250px] mb-4">
                        <TranscriptPanel
                            transcript={transcript}
                            interimTranscript={interimTranscript}
                            isProcessing={isListening}
                        />
                    </div>

                    {/* Interaction controls */}
                    <div className="flex flex-col items-center justify-center p-6 bg-[#0E1220] rounded-2xl border border-[#1E2535] mt-auto">
                        <VoiceRecorder 
                            isRecording={isRecording}
                            audioLevel={audioLevel}
                            onToggle={handleMicToggle}
                            disabled={isSpeaking}
                        />
                    </div>
                </div>
            </div>

            {/* Coaching Prompt Overlay */}
            <CoachingPrompt 
                tip={isSlow ? "You're speaking a bit slowly. Try to slightly pick up the pace and sound confident." : null} 
            />
        </div>
    )
}
