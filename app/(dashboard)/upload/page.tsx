"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, CheckCircle2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const roles = ["Software Engineer", "Data Analyst", "Product Manager", "DevOps Engineer", "Data Scientist", "Marketing", "Finance / CA", "Other"]
const expLevels = ["Fresher", "1–3 Years", "3–6 Years", "6+ Years"]
const interviewTypes = ["Mixed (HR + Tech)", "Technical Only", "HR / Behavioral", "System Design", "Case Study"]
const personas = ["🤝 Friendly Senior", "🔍 The Skeptic", "😐 The Silent Type", "👥 Panel (3 people)", "⚡ Speed Round"]
const difficulties = [
    { label: "😌 Easy", value: "easy", class: "easy" },
    { label: "🔥 Medium", value: "medium", class: "medium" },
    { label: "💀 Brutal", value: "hard", class: "hard" },
]

export default function UploadPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState("")
    const [skills, setSkills] = useState("")
    const [selectedRole, setSelectedRole] = useState("Software Engineer")
    const [experience, setExperience] = useState("Fresher")
    const [interviewType, setInterviewType] = useState("Mixed (HR + Tech)")
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
    const [persona, setPersona] = useState("🤝 Friendly Senior")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isDragOver, setIsDragOver] = useState(false)

    const handleFile = (f: File) => setFile(f)

    const [loadingStage, setLoadingStage] = useState(0)
    
    const loadingStates = [
        "Analyzing resume...",
        "Identifying gaps...",
        "Preparing interview...",
        "Generating questions..."
    ]

    const handleStart = async () => {
        const isResumeUploaded = !!file;
        const isManualFilled = !!skills.trim();

        if (!isResumeUploaded && !isManualFilled) {
            setError("Please upload a resume or enter your skills manually to generate interview questions.");
            return;
        }

        setIsLoading(true)
        setError("")
        
        const loadingInterval = setInterval(() => {
            setLoadingStage(prev => (prev < loadingStates.length - 1 ? prev + 1 : prev))
        }, 1500)

        try {
            const formData = new FormData()
            if (file) {
                formData.append("resume", file)
            }
            formData.append("job_description", jobDescription)
            formData.append("manual_skills", skills)
            formData.append("difficulty", difficulty)
            formData.append("num_questions", "10")
            formData.append("role", selectedRole)
            formData.append("experience", experience)
            formData.append("persona", persona)

            const res = await fetch(`${API_BASE}/sessions/start`, { method: "POST", body: formData })
            if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Failed") }
            const data = await res.json()
            localStorage.setItem("prepsense_session_id", data.session_id)
            localStorage.setItem("prepsense_questions", JSON.stringify(data.questions))
            localStorage.setItem("prepsense_skills", JSON.stringify(data.skills_extracted))
            router.push("/interview")
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.")
        } finally {
            clearInterval(loadingInterval)
            setIsLoading(false)
            setLoadingStage(0)
        }
    }

    const Tag = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200",
                selected
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
            )}
        >
            {label}
        </button>
    )

    return (
        <div className="w-full min-h-screen pb-24 bg-background text-foreground">
            <div className="max-w-[780px] mx-auto px-6 pt-16">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-heading text-[36px] font-extrabold tracking-[-1px] mb-2">
                        Set up your mock interview
                    </h1>
                    <p style={{ color: '#8892A4' }}>Takes 2 minutes. The more detail you give, the better the questions.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-0 mb-10">
                    {[
                        { num: "✓", label: "Resume", state: "done" },
                        { num: "2", label: "Role & Preferences", state: "active" },
                        { num: "3", label: "Interview Style", state: "idle" },
                        { num: "4", label: "Go Live", state: "idle" },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-0 flex-1">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm font-bold border-2 transition-all duration-300"
                                    style={step.state === "active"
                                        ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                                        : step.state === "done"
                                        ? { background: 'color-mix(in srgb, var(--primary) 15%, transparent)', borderColor: 'var(--primary)', color: 'var(--primary)' }
                                        : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                                    }
                                >
                                    {step.num}
                                </div>
                                <span className="text-[13px] font-medium hidden sm:block" style={{ color: step.state === "active" ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                                    {step.label}
                                </span>
                            </div>
                            {i < 3 && <div className="flex-1 h-px mx-2" style={{ background: 'var(--border)', minWidth: 20 }} />}
                        </div>
                    ))}
                </div>


                {/* Upload Zone */}
                <div
                    className={cn(
                        "rounded-[20px] p-16 text-center cursor-pointer transition-all duration-300 mb-4 border-2 border-dashed",
                        isDragOver || file ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/50 hover:bg-primary/[0.02]"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                    onClick={() => {
                        if (!file) {
                            const input = document.createElement("input")
                            input.type = "file"; input.accept = ".pdf,.doc,.docx"
                            input.onchange = (e: Event) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f) }
                            input.click()
                        }
                    }}
                >
                    {!file ? (
                        <>
                            <div className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center mx-auto mb-5 bg-primary/10 border border-primary/20">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-2">Drop your resume here</h3>
                            <p className="text-muted-foreground text-[14px]">or click to browse files</p>
                            <p className="mt-3 text-xs text-muted-foreground/80">PDF, DOCX, or TXT · Max 5MB</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                            <h3 className="font-heading text-lg font-bold">{file.name}</h3>
                            <p className="text-[14px] text-primary">Parsed successfully · Ready</p>
                            <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-xs mt-2 text-destructive hover:underline">Remove</button>
                        </div>
                    )}
                </div>

                {/* AI Hint */}
                <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-8 mt-4 text-sm leading-[1.6] bg-accent-2/10 border border-accent-2/20 text-muted-foreground">
                    <span className="text-lg shrink-0 mt-0.5">✨</span>
                    <span>AI will extract your skills, projects, experience gaps and prepare targeted questions — including asking about <strong className="text-foreground">specific projects</strong> you've worked on.</span>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-7">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[13px] font-semibold text-muted-foreground/80">OR ADD MANUALLY</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Manual Skills */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Your Key Skills &amp; Experience</label>
                    <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. 3 years React, Node.js. Built a payment gateway at XYZ startup. Led team of 4. Strong in DSA..."
                        rows={3}
                        className="w-full rounded-xl px-4 py-3.5 text-sm bg-surface text-foreground font-body border border-border outline-none resize-y transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                {/* Job Description */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the JD here. AI will identify gaps between your profile and this role..."
                        rows={4}
                        className="w-full rounded-xl px-4 py-3.5 text-sm bg-surface text-foreground font-body border border-border outline-none resize-y transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                {/* Target Role */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: '#8892A4' }}>Target Role</label>
                    <div className="flex flex-wrap gap-2.5">
                        {roles.map((r) => <Tag key={r} label={r} selected={selectedRole === r} onClick={() => setSelectedRole(r)} />)}
                    </div>
                </div>

                {/* Experience */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Experience Level</label>
                    <div className="flex flex-wrap gap-2.5">
                        {expLevels.map((e) => (
                            <button
                                key={e}
                                onClick={() => setExperience(e)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200",
                                    experience === e
                                        ? "bg-accent-2/10 border-accent-2 text-accent-2"
                                        : "bg-transparent border-border text-muted-foreground hover:border-accent-2/50"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interview Type */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Interview Type</label>
                    <div className="flex flex-wrap gap-2.5">
                        {interviewTypes.map((t) => <Tag key={t} label={t} selected={interviewType === t} onClick={() => setInterviewType(t)} />)}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Difficulty</label>
                    <div className="flex gap-2">
                        {difficulties.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setDifficulty(d.value as "easy" | "medium" | "hard")}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-[13px] font-medium border text-center transition-all duration-200",
                                    difficulty === d.value
                                        ? d.value === "easy"
                                            ? "bg-primary/10 border-primary text-primary"
                                            : d.value === "medium"
                                                ? "bg-accent-4/10 border-accent-4 text-accent-4"
                                                : "bg-destructive/10 border-destructive text-destructive"
                                        : "bg-transparent border-border text-muted-foreground hover:border-border/80"
                                )}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Persona */}
                <div className="mb-10">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5 text-muted-foreground">Interviewer Persona</label>
                    <div className="flex flex-wrap gap-2.5">
                        {personas.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPersona(p)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200",
                                    persona === p
                                        ? "bg-accent-2/10 border-accent-2 text-accent-2"
                                        : "bg-transparent border-border text-muted-foreground hover:border-accent-2/50"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl px-4 py-3.5 text-sm bg-destructive/10 border border-destructive/20 text-destructive">
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 border-t border-border pt-6">
                    <span className="text-[13px] text-muted-foreground">~10 questions · ~30 min</span>
                    <button
                        disabled={(!file && !skills.trim()) || isLoading}
                        onClick={handleStart}
                        className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-bold text-base text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px bg-primary"
                    >
                        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingStates[loadingStage]}</> : <>Generate Questions &amp; Start <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </div>
            </div>
        </div>
    )
}
