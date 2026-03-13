"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, CheckCircle2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/layout/PageContainer"
import { SectionHeader } from "@/components/layout/SectionHeader"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const roles = ["Software Engineer", "Data Analyst", "Product Manager", "DevOps Engineer", "Data Scientist", "Marketing", "Finance / CA", "Other"]
const expLevels = ["Fresher", "1–3 Years", "3–6 Years", "6+ Years"]
const interviewTypes = [
    { label: "Mixed (HR + Tech)", value: "mixed" },
    { label: "Technical Only", value: "technical" },
    { label: "HR / Behavioral", value: "hr" },
    { label: "Behavioral (STAR)", value: "behavioral" },
    { label: "Stress Interview", value: "stress" },
]
const personas = ["🤝 Friendly Senior", "🔍 The Skeptic", "😐 The Silent Type", "👥 Panel (3 people)", "⚡ Speed Round"]
const difficulties = [
    { label: "😌 Easy", value: "easy", class: "easy" },
    { label: "🔥 Medium", value: "medium", class: "medium" },
    { label: "💀 Brutal", value: "hard", class: "hard" },
]

export default function UploadPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState("")
    const [skills, setSkills] = useState("")
    const [selectedRole, setSelectedRole] = useState("Software Engineer")
    const [experience, setExperience] = useState("Fresher")
    const [interviewType, setInterviewType] = useState(interviewTypes[0])
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
            formData.append("interview_mode", interviewType.value)

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
        <PageContainer maxWidth="narrow" className="py-8">
            <SectionHeader 
                title="Prepare Your Interview" 
                description="Upload your resume or enter your skills to get tailored interview questions and real-time feedback."
                align="center"
                className="mb-12"
            />

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                {/* Resume Upload */}
                <div className="mb-8">
                    <label className="block text-[13px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Resume/CV</label>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 px-6 transition-all duration-200 cursor-pointer overflow-hidden",
                            isDragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-muted/30"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                        />
                        {file ? (
                            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <span className="font-bold text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to Analyze</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                    <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="font-bold text-sm">Drop your resume here</span>
                                <span className="text-xs text-muted-foreground mt-1">PDF, DOCX up to 10MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Skills */}
                <div className="mb-8">
                    <label className="block text-[13px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Manual Skills / Experience (Optional)</label>
                    <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. 3 years React, Node.js. Built a payment gateway at XYZ startup..."
                        rows={3}
                        className="w-full rounded-2xl px-4 py-4 text-sm bg-muted/30 border border-border outline-none resize-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                {/* Job Description */}
                <div className="mb-10">
                    <label className="block text-[13px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Target Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the JD here. AI will identify gaps between your profile and this role..."
                        rows={5}
                        className="w-full rounded-2xl px-4 py-4 text-sm bg-muted/30 border border-border outline-none resize-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pt-6 border-t border-border">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">Target Role</label>
                            <div className="flex flex-wrap gap-2">
                                {roles.slice(0, 6).map((r) => <Tag key={r} label={r} selected={selectedRole === r} onClick={() => setSelectedRole(r)} />)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">Experience</label>
                            <div className="flex flex-wrap gap-2">
                                {expLevels.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => setExperience(e)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200",
                                            experience === e ? "bg-accent-2/10 border-accent-2 text-accent-2" : "border-border text-muted-foreground hover:border-accent-2/50"
                                        )}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">Interview Focus</label>
                            <div className="flex flex-wrap gap-2">
                                {interviewTypes.slice(0, 3).map((t) => <Tag key={t} label={t} selected={interviewType === t} onClick={() => setInterviewType(t)} />)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold uppercase tracking-wider mb-4 text-muted-foreground">Difficulty</label>
                            <div className="flex gap-2">
                                {difficulties.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value as any)}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all duration-200",
                                            difficulty === d.value
                                                ? d.value === "easy" ? "bg-primary/10 border-primary text-primary" : d.value === "medium" ? "bg-accent-4/10 border-accent-4 text-accent-4" : "bg-destructive/10 border-destructive text-destructive"
                                                : "border-border text-muted-foreground hover:border-border/80"
                                        )}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                {/* Experience */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: '#8892A4' }}>Experience Level</label>
                    <div className="flex flex-wrap gap-2.5">
                        {expLevels.map((e) => (
                            <button
                                key={e}
                                onClick={() => setExperience(e)}
                                className="px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200"
                                style={experience === e
                                    ? { background: 'rgba(123,97,255,0.15)', borderColor: '#7B61FF', color: '#7B61FF' }
                                    : { background: 'transparent', borderColor: '#1E2535', color: '#8892A4' }
                                }
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interview Type */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: '#8892A4' }}>Interview Type</label>
                    <div className="flex flex-wrap gap-2.5">
                        {interviewTypes.map((t) => <Tag key={t.value} label={t.label} selected={interviewType.value === t.value} onClick={() => setInterviewType(t)} />)}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="mb-7">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: '#8892A4' }}>Difficulty</label>
                    <div className="flex gap-2">
                        {difficulties.map((d) => (
                            <button
                                key={d.value}
                                onClick={() => setDifficulty(d.value as "easy" | "medium" | "hard")}
                                className="flex-1 py-3 rounded-xl text-[13px] font-medium border text-center transition-all duration-200"
                                style={difficulty === d.value
                                    ? d.value === "easy"
                                        ? { background: 'rgba(78,255,163,0.1)', borderColor: '#4EFFA3', color: '#4EFFA3' }
                                        : d.value === "medium"
                                        ? { background: 'rgba(255,209,102,0.1)', borderColor: '#FFD166', color: '#FFD166' }
                                        : { background: 'rgba(255,107,107,0.1)', borderColor: '#FF6B6B', color: '#FF6B6B' }
                                    : { background: 'transparent', borderColor: '#1E2535', color: '#8892A4' }
                                }
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Persona */}
                <div className="mb-10">
                    <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: '#8892A4' }}>Interviewer Persona</label>
                    <div className="flex flex-wrap gap-2.5">
=======
                <div className="mb-12">
                    <label className="block text-[13px] font-bold uppercase tracking-wider mb-4 text-muted-foreground text-center">Interviewer Persona</label>
                    <div className="flex flex-wrap justify-center gap-2">
>>>>>>> 43af45495dfc197909b53ff7992bfae07c08618d
                        {personas.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPersona(p)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-200",
                                    persona === p ? "bg-accent-2/10 border-accent-2 text-accent-2" : "border-border text-muted-foreground hover:border-accent-2/50"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <button
                    disabled={(!file && !skills.trim()) || isLoading}
                    onClick={handleStart}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-heading font-black text-lg text-primary-foreground transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed bg-primary"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> {loadingStates[loadingStage]}</>
                    ) : (
                        <>Start Interview <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
                <p className="text-center text-[11px] text-muted-foreground mt-4 font-medium uppercase tracking-widest">~10 questions · AI-generated tailored feedback</p>
            </div>
        </PageContainer>
    )
}
