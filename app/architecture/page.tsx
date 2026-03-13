"use client"

import Link from "next/link"
import { ArrowLeft, Server, Database, BrainCircuit, Globe, Code2, Zap, LayoutDashboard, Cpu } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import React from "react"

const archLayers = [
    {
        label: "Frontend",
        nodes: [
            { text: "⚛ React App", type: "frontend" },
            { text: "🎙 Web Speech API", type: "frontend" },
            { text: "🔊 TTS (ElevenLabs)", type: "frontend" },
            { text: "📱 Mobile PWA", type: "frontend" },
        ],
    },
    {
        label: "API Layer",
        nodes: [
            { text: "🚀 FastAPI / Node.js", type: "api" },
            { text: "🔐 Auth (Clerk/JWT)", type: "api" },
            { text: "📁 File Upload Handler", type: "api" },
            { text: "⚡ WebSocket Server", type: "api" },
        ],
    },
    {
        label: "AI Engine",
        nodes: [
            { text: "🧠 Claude API (Questions)", type: "ai" },
            { text: "📄 Resume Parser (LLM)", type: "ai" },
            { text: "🎙 Whisper (STT)", type: "ai" },
            { text: "📊 Report Generator", type: "ai" },
            { text: "🔍 JD Gap Analyzer", type: "ai" },
        ],
    },
    {
        label: "Database",
        nodes: [
            { text: "🗄 PostgreSQL (Users)", type: "db" },
            { text: "📦 Redis (Sessions)", type: "db" },
            { text: "🗂 S3 (Resumes)", type: "db" },
            { text: "📈 TimeSeries (Analytics)", type: "db" },
        ],
    },
    {
        label: "Infra",
        nodes: [
            { text: "☁ AWS / Vercel", type: "infra" },
            { text: "🔄 CI/CD Pipeline", type: "infra" },
            { text: "📊 Analytics (Mixpanel)", type: "infra" },
            { text: "🛡 Rate Limiting", type: "infra" },
        ],
    },
]

const nodeStyles: Record<string, { bg: string; border: string; color: string }> = {
    frontend: { bg: 'rgba(123,97,255,0.1)', border: 'rgba(123,97,255,0.3)', color: '#7B61FF' },
    api:      { bg: 'rgba(78,255,163,0.08)', border: 'rgba(78,255,163,0.25)', color: '#4EFFA3' },
    ai:       { bg: 'rgba(255,209,102,0.08)', border: 'rgba(255,209,102,0.25)', color: '#FFD166' },
    infra:    { bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.25)', color: '#FF6B6B' },
    db:       { bg: 'rgba(100,180,255,0.08)', border: 'rgba(100,180,255,0.25)', color: '#64B4FF' },
}

const stack = [
    { icon: "⚛", title: "Frontend", iconBg: 'rgba(123,97,255,0.1)', items: ["React + TypeScript", "Tailwind CSS", "Web Speech API (STT)", "Framer Motion (animations)", "Zustand (state management)"] },
    { icon: "🚀", title: "Backend", iconBg: 'rgba(78,255,163,0.1)', items: ["FastAPI (Python) or Node.js", "WebSocket for real-time", "Celery (async tasks)", "PDF parser (PyMuPDF)", "JWT Authentication"] },
    { icon: "🧠", title: "AI / ML", iconBg: 'rgba(255,209,102,0.1)', items: ["Claude API (questions + report)", "Whisper API (speech-to-text)", "ElevenLabs (text-to-speech)", "Sentence transformers", "Sentiment analysis model"] },
    { icon: "🗄", title: "Database & Storage", iconBg: 'rgba(100,180,255,0.1)', items: ["PostgreSQL (user data)", "Redis (session + cache)", "AWS S3 (resume files)", "Pinecone (vector search)"] },
    { icon: "☁", title: "DevOps", iconBg: 'rgba(255,107,107,0.1)', items: ["Vercel (frontend deploy)", "Railway / Render (backend)", "GitHub Actions (CI/CD)", "Docker containers"] },
    { icon: "🔑", title: "3rd Party APIs", iconBg: 'rgba(78,255,163,0.1)', items: ["Anthropic Claude (core AI)", "ElevenLabs (voice)", "OpenAI Whisper (STT)", "Clerk (auth)", "Stripe (payments)"] },
]

const buildItems = [
    "Resume upload → AI question generation",
    "Voice interview (TTS + STT)",
    "AI follow-up on vague answers",
    "Post-interview report with ideal answers",
    "Filler word counter",
]
const mockupItems = [
    "College TPO Dashboard",
    "Video emotion analysis",
    "Peer matchmaking",
    "Progress analytics dashboard",
    "Company-specific prep packs",
]

export default function ArchitecturePage() {
    return (
        <div className="w-full pb-24" style={{ background: '#080B14', color: '#E8EDF5' }}>
            <div className="max-w-[1100px] mx-auto px-6 pt-16">

                <h1 className="font-heading text-[42px] font-extrabold tracking-[-1px] mb-3">System Architecture</h1>
                <p className="text-base mb-16" style={{ color: '#8892A4' }}>
                    Full platform architecture for PrepSense — from resume upload to AI interview to detailed report generation.
                </p>

                {/* Architecture Diagram */}
                <div className="rounded-[24px] p-12 mb-12 overflow-x-auto" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
                    <h3 className="text-base font-bold mb-8" style={{ color: '#8892A4' }}>PLATFORM FLOW DIAGRAM</h3>
                    <div className="flex flex-col" style={{ minWidth: 700 }}>
                        {archLayers.map((layer, li) => (
                            <div key={layer.label}>
                                <div className="flex items-stretch gap-0">
                                    <div
                                        className="shrink-0 flex items-center pr-5 text-[11px] font-bold uppercase tracking-[1px]"
                                        style={{ width: 140, color: '#4A5568', borderRight: '1px solid #1E2535' }}
                                    >
                                        {layer.label}
                                    </div>
                                    <div className="flex-1 flex gap-3 py-5 pl-6 items-center flex-wrap">
                                        {layer.nodes.map((node) => {
                                            const s = nodeStyles[node.type]
                                            return (
                                                <div
                                                    key={node.text}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap"
                                                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
                                                >
                                                    {node.text}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                {li < archLayers.length - 1 && (
                                    <div className="flex items-center py-1 text-lg" style={{ color: '#4A5568', paddingLeft: 164 }}>
                                        ↕ {li === 0 ? "REST + WebSocket" : ""}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <h2 className="font-heading text-[28px] font-extrabold tracking-[-0.5px] mb-7">Tech Stack Breakdown</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                    {stack.map((s) => (
                        <div
                            key={s.title}
                            className="rounded-[16px] p-6 transition-all duration-200"
                            style={{ background: '#0E1220', border: '1px solid #1E2535' }}
                            onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(78,255,163,0.2)'; (e.currentTarget).style.transform = 'translateY(-2px)' }}
                            onMouseLeave={(e) => { (e.currentTarget).style.borderColor = '#1E2535'; (e.currentTarget).style.transform = 'none' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl" style={{ background: s.iconBg }}>
                                    {s.icon}
                                </div>
                                <h3 className="font-heading text-[15px] font-bold">{s.title}</h3>
                            </div>
                            <ul className="flex flex-col gap-1.5">
                                {s.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-[13px]" style={{ color: '#8892A4' }}>
                                        <span style={{ color: '#4EFFA3', fontSize: 11 }}>→</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* MVP Plan */}
                <div className="rounded-[24px] p-10" style={{ background: '#0E1220', border: '1px solid #1E2535' }}>
                    <h2 className="font-heading text-[24px] font-extrabold mb-2">Hackathon MVP Build Plan</h2>
                    <p className="text-sm mb-8" style={{ color: '#8892A4' }}>What to actually build vs what to mockup in your slides</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[1px] mb-4" style={{ color: '#4EFFA3' }}>
                                ✅ ACTUALLY BUILD
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {buildItems.map((item) => (
                                    <div key={item} className="px-4 py-3 rounded-[10px] text-sm" style={{ background: 'rgba(78,255,163,0.05)', border: '1px solid rgba(78,255,163,0.15)', color: '#8892A4' }}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[1px] mb-4" style={{ color: '#FFD166' }}>
                                🖼 SHOW AS MOCKUP
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {mockupItems.map((item) => (
                                    <div key={item} className="px-4 py-3 rounded-[10px] text-sm" style={{ background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.15)', color: '#8892A4' }}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
