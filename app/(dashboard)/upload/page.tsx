"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, CheckCircle2, ChevronDown, UserSquare2, Briefcase, Target, Layers, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function UploadPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // UI selectors
    const [selectedRole, setSelectedRole] = useState("Frontend Engineer")
    const [experience, setExperience] = useState("Mid-Level")
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
    const [persona, setPersona] = useState("Technical Hiring Manager")
    const [numQuestions, setNumQuestions] = useState(5)

    const roles = ["Frontend Engineer", "Backend Engineer", "Full Stack", "Data Scientist", "Product Manager"]
    const personas = ["Technical Hiring Manager", "Friendly Recruiter", "Strict Staff Engineer"]
    const difficultyOptions: Array<{ value: "easy" | "medium" | "hard"; label: string; color: string }> = [
        { value: "easy", label: "Easy", color: "border-accent text-accent bg-accent/10" },
        { value: "medium", label: "Medium", color: "border-[var(--accent-4)] text-[var(--accent-4)] bg-[var(--accent-4)]/10" },
        { value: "hard", label: "Hard", color: "border-destructive text-destructive bg-destructive/10" },
    ]

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0])
    }

    const handleStart = async () => {
        if (!file || !jobDescription.trim()) return
        setIsLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("resume", file)
            formData.append("job_description", jobDescription)
            formData.append("difficulty", difficulty)
            formData.append("num_questions", String(numQuestions))
            formData.append("role", selectedRole)
            formData.append("experience", experience)
            formData.append("persona", persona)

            const res = await fetch(`${API_BASE}/sessions/start`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || "Failed to start session")
            }

            const data = await res.json()
            localStorage.setItem("prepsense_session_id", data.session_id)
            localStorage.setItem("prepsense_questions", JSON.stringify(data.questions))
            localStorage.setItem("prepsense_skills", JSON.stringify(data.skills_extracted))

            router.push("/interview")
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full py-1 px-4 mb-4">
                    <Layers className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Configuration</span>
                </div>
                <h1 className="font-heading text-4xl font-extrabold tracking-tight mb-2">Configure Interview</h1>
                <p className="text-muted-foreground text-lg">Define exactly what kind of interview you want to practice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Context (Resume + JD) */}
                <div className="space-y-8">
                    <div className="bg-surface/50 border border-border/50 rounded-[24px] p-6 backdrop-blur-md shadow-lg">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-accent" /> Base Context
                        </h3>

                        {/* Resume Upload */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-6",
                                file ? "border-accent/40 bg-accent/5" : "border-border/60 hover:border-accent/50 hover:bg-accent/5 bg-background/50"
                            )}
                            onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = ".pdf,.doc,.docx"
                                input.onchange = (e: any) => {
                                    if (e.target.files?.length) setFile(e.target.files[0])
                                }
                                input.click()
                            }}
                        >
                            {!file ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-heading font-medium text-sm mb-1 text-foreground">Click or Drag &amp; Drop</h4>
                                    <p className="text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-5 h-5 text-accent" />
                                        <h4 className="font-heading font-bold text-sm text-foreground truncate max-w-[150px]">{file.name}</h4>
                                        <CheckCircle2 className="w-4 h-4 text-accent" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                        className="text-[10px] font-bold text-destructive hover:bg-destructive/10 px-3 py-1 rounded-md transition-colors uppercase tracking-wider"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Job Description */}
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-accent-4" /> Job Description
                        </h3>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job requirements to let the AI specialize the questions..."
                            className="w-full bg-background/50 border border-border/60 rounded-xl p-4 min-h-[160px] text-sm text-foreground font-body resize-y focus:border-accent-4 focus:ring-1 focus:ring-accent-4/50 transition-all outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                {/* Right Column: Selectors */}
                <div className="bg-surface/50 border border-border/50 rounded-[24px] p-6 backdrop-blur-md shadow-lg space-y-8">

                    {/* Target Role */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-accent-2" /> Target Role
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all border",
                                        selectedRole === role
                                            ? "bg-accent-2/10 border-accent-2/40 text-accent-2 shadow-[0_0_15px_rgba(123,97,255,0.1)]"
                                            : "bg-background/50 border-border/50 text-muted-foreground hover:border-accent-2/30 hover:text-foreground"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Experience + Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-3">Experience</h3>
                            <div className="relative">
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full appearance-none bg-background/50 border border-border/60 rounded-lg px-4 py-3 text-sm font-medium text-foreground focus:border-accent-2 outline-none"
                                >
                                    <option>Junior / Entry Level</option>
                                    <option>Mid-Level</option>
                                    <option>Senior</option>
                                    <option>Lead / Staff</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-3">Difficulty</h3>
                            <div className="flex gap-2">
                                {difficultyOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${difficulty === opt.value ? opt.color : "border-border text-muted-foreground hover:border-muted-foreground"}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Questions slider */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground mb-3">
                            Questions: <span className="text-accent">{numQuestions}</span>
                        </h3>
                        <input
                            type="range" min={3} max={10} value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="w-full accent-accent h-2 cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>3</span><span>10</span>
                        </div>
                    </div>

                    {/* AI Persona */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <UserSquare2 className="w-4 h-4 text-accent-3" /> Interview Persona
                        </h3>
                        <div className="space-y-2">
                            {personas.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPersona(p)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                                        persona === p
                                            ? "bg-accent-3/10 border-accent-3/40 text-accent-3"
                                            : "bg-background/30 border-border/40 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                                    )}
                                >
                                    {p}
                                    {persona === p && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-5 py-4 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <button
                    className="px-6 py-3 rounded-xl font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors text-sm"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    disabled={!file || !jobDescription || isLoading}
                    onClick={handleStart}
                    className="px-8 py-3 rounded-xl font-heading font-bold bg-accent text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(78,255,163,0.25)] flex items-center gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Resume...</>
                    ) : (
                        <>Generate Interview <Layers className="w-4 h-4" /></>
                    )}
                </button>
            </div>
        </div>
    )
}
