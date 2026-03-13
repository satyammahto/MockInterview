'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, Search, ArrowRight, Loader2, Sparkles, MessageSquare, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface QuestionsResponse {
    role: string
    technical_questions: string[]
    behavioral_questions: string[]
}

export default function QuestionGeneratorPage() {
    const [file, setFile] = useState<File | null>(null)
    const [role, setRole] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<QuestionsResponse | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleGenerate = async () => {
        if (!file || !role) return

        setIsGenerating(true)
        const formData = new FormData()
        formData.append('resume', file)
        formData.append('role', role)

        try {
            const response = await fetch('http://localhost:8000/question-generator/generate-questions', {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Generation failed:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="container max-w-6xl mx-auto py-10 px-6 space-y-10 min-h-screen">
            <header className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full py-1 px-4 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">AI Powered</span>
                </div>
                <h1 className="text-4xl font-heading font-extrabold tracking-tight">Interview Question Generator</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Generate personalized technical and behavioral questions based on your unique experience.
                </p>
            </header>

            {!result ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Resume Upload Card */}
                        <Card className="border-border shadow-xl bg-card overflow-hidden h-full">
                            <CardHeader className="bg-surface/50 pb-8 border-b border-border/50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-accent" />
                                    1. Upload Resume
                                </CardTitle>
                                <CardDescription>Provide your latest resume in PDF format.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div 
                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group h-full flex flex-col items-center justify-center
                                        ${file ? 'border-accent bg-accent/5' : 'border-border hover:border-accent hover:bg-surface'}
                                    `}
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                >
                                    <input 
                                        type="file" 
                                        id="resume-upload" 
                                        className="hidden" 
                                        accept=".pdf" 
                                        onChange={handleFileChange}
                                    />
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
                                            <p className="font-bold">Drag and drop resume</p>
                                            <p className="text-sm text-muted-foreground">or click to browse</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Job Role Selection Card */}
                        <Card className="border-border shadow-xl bg-card overflow-hidden h-full">
                            <CardHeader className="bg-surface/50 pb-8 border-b border-border/50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Search className="w-5 h-5 text-accent" />
                                    2. Target Role
                                </CardTitle>
                                <CardDescription>What position are you interviewing for?</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Desired Job Role</Label>
                                    <Input 
                                        placeholder="e.g. Senior Frontend Engineer" 
                                        className="h-14 rounded-xl border-border bg-surface hover:border-accent focus:ring-accent transition-all"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                </div>
                                <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        <Sparkles className="w-3 h-3 inline mr-1 text-accent" />
                                        Our AI will tailor questions based on your resume's technology stack matched with {role || 'your target role'}.
                                    </p>
                                </div>
                                <Button 
                                    className="w-full h-16 rounded-xl text-lg font-bold group mt-4" 
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={!file || !role || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate Questions
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold capitalize">Interview Questions for {result.role}</h2>
                            <p className="text-muted-foreground text-sm">Personalized based on your background.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl" onClick={() => setResult(null)}>
                            Generate New Set
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Technical Questions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Code className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Technical Questions</h3>
                            </div>
                            <div className="space-y-4">
                                {result.technical_questions.map((q, i) => (
                                    <QuestionCard key={i} index={i + 1} text={q} theme="blue" />
                                ))}
                            </div>
                        </div>

                        {/* Behavioral Questions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Behavioral Questions</h3>
                            </div>
                            <div className="space-y-4">
                                {result.behavioral_questions.map((q, i) => (
                                    <QuestionCard key={i} index={i + 1} text={q} theme="purple" />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

function QuestionCard({ index, text, theme }: { index: number, text: string, theme: 'blue' | 'purple' }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="border-border/50 hover:border-accent/30 transition-all hover:shadow-lg group bg-card/50 backdrop-blur-sm overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${theme === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} opacity-30 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <span className={`text-sm font-black opacity-20 group-hover:opacity-100 transition-opacity ${theme === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>
                            {index.toString().padStart(2, '0')}
                        </span>
                        <p className="text-sm font-medium leading-relaxed">
                            {text}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
