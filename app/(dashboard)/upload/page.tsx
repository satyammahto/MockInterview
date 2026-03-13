"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, CheckCircle2, FileText } from "lucide-react"
import { useSession } from "@/hooks/useSession"
import { useAuth } from "@/hooks/useAuth"

const roles = ["Software Engineer", "Data Analyst", "Product Manager", "DevOps Engineer", "Data Scientist", "Marketing", "Finance / CA", "Other"]
const expLevels = ["Fresher", "1–3 Years", "3–6 Years", "6+ Years"]
const interviewTypes = ["Mixed (HR + Tech)", "Technical Only", "HR / Behavioral", "System Design", "Case Study"]
const personas = ["🤝 Friendly Senior", "🔍 The Skeptic", "😐 The Silent Type", "👥 Panel (3 people)", "⚡ Speed Round"]
const difficulties = [
  { label: "😌 Easy", value: "easy" as const },
  { label: "🔥 Medium", value: "medium" as const },
  { label: "💀 Brutal", value: "hard" as const },
]

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { startSession, isLoading, uploadProgress, error } = useSession()

  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [selectedRole, setSelectedRole] = useState("Software Engineer")
  const [experience, setExperience] = useState("Fresher")
  const [interviewType, setInterviewType] = useState("Mixed (HR + Tech)")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [persona, setPersona] = useState("🤝 Friendly Senior")
  const [isDragOver, setIsDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [, setCloudinaryProgress] = useState(0)

  const handleFile = (f: File) => setFile(f)

const handleStart = async () => {
  if (!file || !jobDescription.trim()) return
  if (!user) {
    router.push("/login")
    return
  }
  setLocalError(null)
  setCloudinaryProgress(0)

  try {
    // Step 1 — Upload resume to Cloudinary
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const uploadData = await uploadRes.json()

    if (!uploadRes.ok) {
      throw new Error(uploadData?.error ?? "Upload failed. Please try again.")
    }

    const resumeUrl = uploadData.secure_url
    setCloudinaryProgress(100)
    setIsUploading(false)

    // Step 2 — Call Cloud Function
    const result = await startSession({
      resumeUrl,
      jobDescription,
      difficulty,
      numQuestions: 10,
      role: selectedRole,
      experience,
      persona,
    })

    if (result) {
      localStorage.setItem("prepsense_session_id", result.sessionId)
      localStorage.setItem("prepsense_questions", JSON.stringify(result.questions))
      localStorage.setItem("prepsense_skills", JSON.stringify(result.skillsExtracted))
      router.push("/interview")
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong. Please try again."
    setLocalError(msg)
    setIsUploading(false)
  }
}

  const Tag = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200"
      style={selected
        ? { background: "rgba(78,255,163,0.12)", borderColor: "#4EFFA3", color: "#4EFFA3" }
        : { background: "transparent", borderColor: "#1E2535", color: "#8892A4" }}
    >
      {label}
    </button>
  )

  return (
    <div className="w-full min-h-screen pb-24" style={{ background: "#080B14", color: "#E8EDF5" }}>
      <div className="max-w-[780px] mx-auto px-6 pt-16">

        <div className="mb-12">
          <h1 className="font-heading text-[36px] font-extrabold tracking-[-1px] mb-2">Set up your mock interview</h1>
          <p style={{ color: "#8892A4" }}>Takes 2 minutes. The more detail you give, the better the questions.</p>
        </div>

        {/* Upload Zone */}
        <div
          className="rounded-[20px] p-16 text-center cursor-pointer transition-all duration-300 mb-4"
          style={{
            border: isDragOver || file ? "2px dashed #4EFFA3" : "2px dashed #1E2535",
            background: isDragOver || file ? "rgba(78,255,163,0.04)" : "#0E1220",
          }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
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
              <div className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(78,255,163,0.1)", border: "1px solid rgba(78,255,163,0.2)" }}>
                <FileText className="w-8 h-8" style={{ color: "#4EFFA3" }} />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Drop your resume here</h3>
              <p style={{ color: "#8892A4", fontSize: 14 }}>or click to browse files</p>
              <p className="mt-3 text-xs" style={{ color: "#4A5568" }}>PDF, DOCX · Max 5MB</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10" style={{ color: "#4EFFA3" }} />
              <h3 className="font-heading text-lg font-bold">{file.name}</h3>
              <p style={{ color: "#4EFFA3", fontSize: 14 }}>Ready to upload</p>
              <button onClick={e => { e.stopPropagation(); setFile(null) }} className="text-xs mt-2" style={{ color: "#FF6B6B" }}>Remove</button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: "#8892A4" }}>
              <span>Uploading resume...</span><span>{uploadProgress}%</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: "#1E2535" }}>
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, background: "#4EFFA3" }} />
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="mb-7 mt-6">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Job Description</label>
          <textarea
            value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the JD here. AI will identify gaps between your profile and this role..."
            rows={4}
            className="w-full rounded-xl px-4 py-3.5 text-sm outline-none resize-y transition-all duration-200"
            style={{ background: "#0E1220", border: "1px solid #1E2535", color: "#E8EDF5" }}
            onFocus={e => { e.target.style.borderColor = "#4EFFA3"; e.target.style.boxShadow = "0 0 0 3px rgba(78,255,163,0.08)" }}
            onBlur={e => { e.target.style.borderColor = "#1E2535"; e.target.style.boxShadow = "none" }}
          />
        </div>

        {/* Target Role */}
        <div className="mb-7">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Target Role</label>
          <div className="flex flex-wrap gap-2.5">
            {roles.map(r => <Tag key={r} label={r} selected={selectedRole === r} onClick={() => setSelectedRole(r)} />)}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-7">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Experience Level</label>
          <div className="flex flex-wrap gap-2.5">
            {expLevels.map(e => (
              <button key={e} onClick={() => setExperience(e)}
                className="px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200"
                style={experience === e
                  ? { background: "rgba(123,97,255,0.15)", borderColor: "#7B61FF", color: "#7B61FF" }
                  : { background: "transparent", borderColor: "#1E2535", color: "#8892A4" }}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Interview Type */}
        <div className="mb-7">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Interview Type</label>
          <div className="flex flex-wrap gap-2.5">
            {interviewTypes.map(t => <Tag key={t} label={t} selected={interviewType === t} onClick={() => setInterviewType(t)} />)}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-7">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Difficulty</label>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button key={d.value} onClick={() => setDifficulty(d.value)}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium border text-center transition-all duration-200"
                style={difficulty === d.value
                  ? d.value === "easy" ? { background: "rgba(78,255,163,0.1)", borderColor: "#4EFFA3", color: "#4EFFA3" }
                    : d.value === "medium" ? { background: "rgba(255,209,102,0.1)", borderColor: "#FFD166", color: "#FFD166" }
                      : { background: "rgba(255,107,107,0.1)", borderColor: "#FF6B6B", color: "#FF6B6B" }
                  : { background: "transparent", borderColor: "#1E2535", color: "#8892A4" }}
              >{d.label}</button>
            ))}
          </div>
        </div>

        {/* Persona */}
        <div className="mb-10">
          <label className="block text-[13px] font-semibold uppercase tracking-[0.5px] mb-2.5" style={{ color: "#8892A4" }}>Interviewer Persona</label>
          <div className="flex flex-wrap gap-2.5">
            {personas.map(p => (
              <button key={p} onClick={() => setPersona(p)}
                className="px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200"
                style={persona === p
                  ? { background: "rgba(123,97,255,0.15)", borderColor: "#7B61FF", color: "#7B61FF" }
                  : { background: "transparent", borderColor: "#1E2535", color: "#8892A4" }}
              >{p}</button>
            ))}
          </div>
        </div>

        {(error || localError) && (
          <div className="mb-6 rounded-xl px-4 py-3.5 text-sm" style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B" }}>
            {localError || error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: "#4A5568" }}>~10 questions · ~30 min</span>
          <button
            disabled={!file || !jobDescription || isLoading || isUploading} onClick={handleStart}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-bold text-base text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
            style={{ background: "#4EFFA3" }}
          >
            {isUploading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading resume...</>
              : isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating questions...</>
                : <>Generate Questions &amp; Start <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
