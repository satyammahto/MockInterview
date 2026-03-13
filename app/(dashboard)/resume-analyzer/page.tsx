"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, CheckCircle2, XCircle, Brain, Briefcase, Languages, Target, Search, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useResumeAnalyzer } from "@/hooks/useResumeAnalyzer"

interface AnalysisResult {
  score: number
  role: string
  keyword_match: { strengths: string[]; improvements: string[] }
  impact: { strengths: string[]; improvements: string[] }
  grammar: { strengths: string[]; improvements: string[] }
  experience: { strengths: string[]; improvements: string[] }
  ats: { strengths: string[]; improvements: string[] }
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [role, setRole] = useState("")
  const [jd, setJd] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const { analyzeResume, isAnalyzing, uploadProgress, error } = useResumeAnalyzer()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleAnalyze = async () => {
    if (!file || !role || !jd) return

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Upload failed")

      const uploadData = await uploadRes.json()
      const resumeUrl = uploadData.secure_url

      // 2. Call Cloud Function via hook
      const data = await analyzeResume(resumeUrl, role, jd)
      if (data) setResult(data)
    } catch (err) {
      console.error(err)
      alert("Failed to upload or analyze resume")
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight">Resume Analyzer</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Upload your resume and get AI-powered insights to optimize it for your dream role.
        </p>
      </header>

      {!result ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-border shadow-xl bg-card overflow-hidden">
            <CardHeader className="bg-surface pb-8">
              <CardTitle className="text-2xl">Upload &amp; Analyze</CardTitle>
              <CardDescription>Fill in the details below to start the AI analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Resume (PDF only)</Label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group ${file ? "border-accent bg-accent/5" : "border-border hover:border-accent hover:bg-surface"}`}
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <input type="file" id="resume-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-bold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-surface2 rounded-xl flex items-center justify-center text-muted-foreground mb-2 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-bold">Drag and drop or click to upload</p>
                      <p className="text-sm text-muted-foreground">PDF only, max 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload progress */}
              {isAnalyzing && uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                    <span>Uploading...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-surface2 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Desired Role</Label>
                  <Input placeholder="e.g. Senior Frontend Engineer" className="h-14 rounded-xl" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Job Description</Label>
                  <Textarea placeholder="Paste the job description here..." className="min-h-[140px] rounded-xl resize-none" value={jd} onChange={e => setJd(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-sm text-red-400 rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20">{error}</p>}

              <Button className="w-full h-16 rounded-xl text-lg font-bold group" size="lg" onClick={handleAnalyze} disabled={!file || !role || !jd || isAnalyzing}>
                {isAnalyzing ? (
                  <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Analyzing with AI..."}</>
                ) : (
                  <>Start AI Analysis <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-border shadow-xl bg-card overflow-hidden sticky top-28">
              <CardHeader className="bg-surface pb-6 border-b border-border">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" /> Overall Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface2" />
                    <motion.circle
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray={364.4}
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 - (364.4 * result.score) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="text-accent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-heading font-black">{result.score}</span>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 capitalize">{result.role}</h3>
                  <p className="text-sm text-muted-foreground italic">
                    &ldquo;{result.score > 80 ? "Excellent match!" : result.score > 60 ? "Good potential, some gaps found." : "Requires significant optimization."}&rdquo;
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setResult(null)}>Analyze Another</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisSection icon={<Search className="w-5 h-5" />} title="Keyword & Skill Match" data={result.keyword_match} />
              <AnalysisSection icon={<Target className="w-5 h-5" />} title="Outcome & Impact Focus" data={result.impact} />
              <AnalysisSection icon={<Languages className="w-5 h-5" />} title="Grammar & Language" data={result.grammar} />
              <AnalysisSection icon={<Briefcase className="w-5 h-5" />} title="Experience Relevancy" data={result.experience} />
            </div>
            <AnalysisSection icon={<FileText className="w-5 h-5" />} title="ATS Friendliness" fullWidth data={result.ats} />
          </div>
        </div>
      )}
    </div>
  )
}

function AnalysisSection({ icon, title, data, fullWidth = false }: { icon: React.ReactNode; title: string; data: { strengths: string[]; improvements: string[] }; fullWidth?: boolean }) {
  return (
    <Card className={`border-border shadow-md bg-card overflow-hidden ${fullWidth ? "col-span-full" : ""}`}>
      <CardHeader className="py-4 px-6 border-b border-border bg-surface/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2"><span className="text-accent">{icon}</span>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-black tracking-widest text-green-500/80">Strengths</div>
          <ul className="space-y-2">
            {data.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /><span>{item}</span></li>
            ))}
            {data.strengths.length === 0 && <li className="text-sm text-muted-foreground italic">No strengths identified yet.</li>}
          </ul>
        </div>
        <div className="pt-2 space-y-3 border-t border-border/50">
          <div className="text-[10px] uppercase font-black tracking-widest text-red-500/80">Improvements</div>
          <ul className="space-y-2">
            {data.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm"><XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /><span>{item}</span></li>
            ))}
            {data.improvements.length === 0 && <li className="text-sm text-muted-foreground italic">No major improvements needed.</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
