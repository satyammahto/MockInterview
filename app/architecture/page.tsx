"use client"

import Link from "next/link"
import { ArrowLeft, Server, Database, BrainCircuit, Globe, Code2, Zap, LayoutDashboard, Cpu, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import React from "react"

export default function ArchitecturePage() {
    const stack = [
        { name: "Next.js 14", icon: Globe, description: "App Router & SSR", color: "text-foreground" },
        { name: "Tailwind v4", icon: LayoutDashboard, description: "Atomic Styling", color: "text-[#38bdf8]" },
        { name: "Framer Motion", icon: Zap, description: "Fluid Animations", color: "text-[#ec4899]" },
        { name: "WebRTC", icon: MicIcon, description: "Audio Streaming", color: "text-accent" },
        { name: "OpenAI GPT-4", icon: BrainCircuit, description: "Interview Logic", color: "text-accent-4" },
        { name: "FastAPI", icon: Server, description: "Python Backend", color: "text-accent-2" },
    ]

    const roadmap = [
        { phase: "Phase 1: MVP Core", status: "completed", items: ["Responsive UI built with Next.js", "Faux Audio Visualizer", "Drag-and-Drop Resume UI", "Static Mock Data for Reports"] },
        { phase: "Phase 2: Hackathon Target", status: "in-progress", items: ["Python FastAPI Backend", "OpenAI API Integration", "Real-Time STT (Speech-to-Text)", "Dynamic Report Generation"] },
        { phase: "Phase 3: Post-Launch", status: "pending", items: ["WebRTC persistent audio", "User Auth & Profiles", "Global Leaderboards"] },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative pb-32">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(123,97,255,0.08)_0%,transparent_70%)]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(78,255,163,0.08)_0%,transparent_70%)]" />
            </div>

            {/* Top Nav */}
            <nav className="relative z-10 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>
                <div className="font-heading font-extrabold text-xl flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-accent-2" /> PrepSense
                </div>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12">

                <header className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/80 border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                        <Server className="w-4 h-4 text-accent-4" /> System Overview
                    </div>
                    <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Platform <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">Architecture</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Designed for extremely low-latency audio processing and highly realistic LLM interactions.
                    </p>
                </header>

                {/* System Diagram Section */}
                <section className="mb-32">
                    <h2 className="font-heading text-2xl font-bold mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" /> Data Flow Diagram
                    </h2>

                    <div className="bg-surface/30 border border-border/50 rounded-[32px] p-8 md:p-16 backdrop-blur-xl relative shadow-2xl overflow-x-auto">

                        {/* Visual Diagram Representation */}
                        <div className="min-w-[700px] flex flex-col items-center gap-8 relative">

                            {/* Client Layer */}
                            <div className="flex items-center gap-8 w-full justify-center">
                                <DiagramNode icon={Globe} label="Next.js Client" sub="React UI / WebRTC" color="var(--foreground)" />
                            </div>

                            {/* Connecting Line */}
                            <div className="w-1 h-12 bg-gradient-to-b from-border to-accent/50 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent animate-ping" />
                            </div>

                            {/* API Gateway Layer */}
                            <div className="flex items-center gap-8 w-full justify-center">
                                <DiagramNode icon={Server} label="FastAPI Gateway" sub="WebSockets / Auth" color="var(--accent-2)" />
                            </div>

                            {/* Branching Lines */}
                            <div className="flex w-[400px] justify-between relative mt-4">
                                <div className="w-1/2 h-12 border-t border-l border-border/50 rounded-tl-xl relative">
                                    <div className="absolute bottom-0 left-[-2px] w-1 h-1/2 bg-gradient-to-t from-accent-4/50 to-transparent" />
                                </div>
                                <div className="w-1/2 h-12 border-t border-r border-border/50 rounded-tr-xl relative">
                                    <div className="absolute bottom-0 right-[-2px] w-1 h-1/2 bg-gradient-to-t from-accent-3/50 to-transparent" />
                                </div>
                            </div>

                            {/* Services Layer */}
                            <div className="flex items-center gap-24 w-full justify-center">
                                <DiagramNode icon={BrainCircuit} label="AI Engine" sub="LLM Prompting" color="var(--accent-4)" glow />
                                <DiagramNode icon={Database} label="Vector DB" sub="RAG / Resumes" color="var(--accent-3)" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Grid */}
                <section className="mb-32">
                    <h2 className="font-heading text-2xl font-bold mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent-2" /> Technology Stack
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {stack.map((tech) => (
                            <Card key={tech.name} className="bg-surface/40 backdrop-blur-md border-border/50 hover:bg-surface/80 hover:border-border transition-all duration-300 group">
                                <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
                                    <tech.icon className={`w-8 h-8 ${tech.color} group-hover:scale-110 transition-transform`} />
                                    <div>
                                        <div className="font-heading font-bold text-lg">{tech.name}</div>
                                        <div className="text-sm text-muted-foreground">{tech.description}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Roadmap / MVP Plan */}
                <section>
                    <h2 className="font-heading text-2xl font-bold mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent-4" /> Hackathon Roadmap
                    </h2>

                    <div className="space-y-6">
                        {roadmap.map((phase, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-6 bg-surface/30 border border-border/50 rounded-2xl p-8 backdrop-blur-sm">
                                <div className="md:w-64 shrink-0">
                                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                        {phase.status === 'completed' && <span className="text-accent">● Complete</span>}
                                        {phase.status === 'in-progress' && <span className="text-accent-2 animate-pulse">● In Progress</span>}
                                        {phase.status === 'pending' && <span className="text-muted-foreground">○ Planned</span>}
                                    </div>
                                    <h3 className="font-heading text-xl font-bold">{phase.phase}</h3>
                                </div>
                                <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {phase.items.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-foreground/80 bg-background/50 px-4 py-2.5 rounded-lg border border-border/40">
                                            <Cpu className="w-4 h-4 text-muted-foreground shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}

function DiagramNode({ icon: Icon, label, sub, color, glow = false }: { icon: LucideIcon, label: string, sub: string, color: string, glow?: boolean }) {
    return (
        <div className="relative group">
            {glow && <div className="absolute inset-0 bg-accent-4/20 blur-2xl rounded-2xl group-hover:bg-accent-4/40 transition-colors" />}
            <div className="bg-background border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center w-48 text-center relative z-10 shadow-lg group-hover:-translate-y-1 transition-transform">
                <Icon className="w-8 h-8 mb-4" style={{ color }} />
                <div className="font-heading font-bold text-sm mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
        </div>
    )
}

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
}
