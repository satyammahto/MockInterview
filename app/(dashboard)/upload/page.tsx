"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"

export default function UploadPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [jobDescription, setJobDescription] = useState("")

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files?.length) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleStart = () => {
        // In a real app we'd trigger an API or backend process here.
        // For UI MVP, we'll route directly to the interview screen.
        router.push("/interview")
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">New Practice Session</h1>
                <p className="text-muted-foreground">Upload your resume and the job description to tailor the interview.</p>
            </div>

            {/* Resume Upload Zone */}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-surface ${file ? 'border-accent bg-accent/5' : 'border-border hover:border-accent hover:bg-accent/5'}`}
                onClick={() => {
                    // Trigger hidden file input
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
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center mx-auto mb-6 text-accent">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading font-bold text-xl mb-2">Upload Resume</h3>
                        <p className="text-muted-foreground text-sm">Drag & drop your file here, or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-4 font-mono">Supports PDF, DOCX (Max 5MB)</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-2)]/10 border border-[var(--accent-2)]/20 flex items-center justify-center mx-auto mb-4 text-[var(--accent-2)]">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-heading font-bold text-lg">{file.name}</h3>
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-muted-foreground text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                            }}
                            className="mt-6 text-xs font-bold text-destructive hover:text-destructive/80 transition-colors uppercase tracking-wider"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Job Description Input */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Job Description
                </label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                    className="w-full bg-surface border border-border rounded-2xl p-6 min-h-[200px] text-foreground font-body resize-y focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                <button
                    className="px-6 py-3 rounded-xl font-heading font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => router.back()}
                >
                    Cancel
                </button>
                <button
                    disabled={!file || !jobDescription}
                    onClick={handleStart}
                    className="px-8 py-3 rounded-xl font-heading font-bold bg-accent text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(78,255,163,0.25)]"
                >
                    Start Interview
                </button>
            </div>
        </div>
    )
}
