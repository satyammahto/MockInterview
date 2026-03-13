"use client"

import Link from "next/link"
import { ArrowRight, FileText, Mic, Brain, BarChart3, Users, BookOpen } from "lucide-react"

const features = [
    {
        icon: FileText,
        title: "Resume Intelligence",
        description: "AI parses your resume and generates questions from your exact projects, skills, and experience gaps. Not generic — hyper-personalized.",
        iconBg: "rgba(78,255,163,0.1)",
        color: "#4EFFA3",
    },
    {
        icon: Mic,
        title: "Voice Interview Engine",
        description: "Real AI voice asks questions. You speak your answers. Filler words, pace, confidence — all analyzed in real time.",
        iconBg: "rgba(123,97,255,0.1)",
        color: "#7B61FF",
    },
    {
        icon: Brain,
        title: "Smart Follow-ups",
        description: "Give a vague answer? The AI probes deeper — just like a real interviewer. Keeps you on your toes.",
        iconBg: "rgba(255,209,102,0.1)",
        color: "#FFD166",
    },
    {
        icon: BarChart3,
        title: "Detailed Report Card",
        description: "Per-question breakdown with your answer vs ideal answer side-by-side. Scores for clarity, confidence, relevance and depth.",
        iconBg: "rgba(255,107,107,0.1)",
        color: "#FF6B6B",
    },
    {
        icon: Users,
        title: "Interviewer Personas",
        description: "Choose The Skeptic, The Friendly Senior, or Panel Mode with 3 interviewers. Practice for any style.",
        iconBg: "rgba(78,255,163,0.1)",
        color: "#4EFFA3",
    },
    {
        icon: BookOpen,
        title: "College TPO Dashboard",
        description: "For placement officers — track entire batch readiness, set company-specific prep packs, and export placement reports.",
        iconBg: "rgba(123,97,255,0.1)",
        color: "#7B61FF",
    },
]

const stats = [
    { value: "50", suffix: "K+", label: "Mock Interviews Done" },
    { value: "87", suffix: "%", label: "Placement Rate" },
    { value: "200", suffix: "+", label: "Companies Covered" },
    { value: "4.9", suffix: "★", label: "Student Rating" },
]

export default function LandingPage() {
    return (
        <div className="w-full" style={{ background: '#080B14', color: '#E8EDF5' }}>

            {/* ── Hero ── */}
            <section className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">

                {/* Gradient Blobs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute rounded-full animate-float"
                        style={{
                            width: 600, height: 600,
                            background: 'radial-gradient(circle, rgba(78,255,163,0.08) 0%, transparent 70%)',
                            filter: 'blur(120px)',
                            top: -200, left: -100,
                        }}
                    />
                    <div
                        className="absolute rounded-full animate-float"
                        style={{
                            width: 500, height: 500,
                            background: 'radial-gradient(circle, rgba(123,97,255,0.1) 0%, transparent 70%)',
                            filter: 'blur(120px)',
                            bottom: -100, right: -100,
                            animationDelay: '-4s',
                        }}
                    />
                </div>

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 text-sm font-medium"
                    style={{ background: 'rgba(78,255,163,0.08)', border: '1px solid rgba(78,255,163,0.2)', color: '#4EFFA3' }}
                >
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#4EFFA3' }} />
                    AI-Powered Interview Coach
                </div>

                {/* Title */}
                <h1
                    className="font-heading font-extrabold leading-[1.0] tracking-[-2px] mb-6 max-w-4xl"
                    style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}
                >
                    Ace your next<br />
                    interview with<br />
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, #4EFFA3, #7B61FF)' }}
                    >
                        PrepSense AI
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg max-w-xl mb-12 leading-[1.7] font-light" style={{ color: '#8892A4' }}>
                    Upload your resume, let AI analyze your profile, and practice with a real voice interview. Get detailed feedback that actually helps you improve.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                    <Link
                        href="/upload"
                        className="flex items-center gap-2.5 px-9 py-4 rounded-xl font-heading font-bold text-base text-black transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: '#4EFFA3', boxShadow: '0 0 0 0 transparent' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 40px rgba(78,255,163,0.35)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 transparent' }}
                    >
                        🎙️ Start Free Mock Interview
                    </Link>
                    <Link
                        href="/architecture"
                        className="flex items-center gap-2.5 px-9 py-4 rounded-xl font-heading font-semibold text-base transition-all duration-200"
                        style={{ background: 'transparent', border: '1px solid #1E2535', color: '#E8EDF5' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#8892A4'; (e.currentTarget as HTMLAnchorElement).style.background = '#0E1220' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1E2535'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                    >
                        View Architecture <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-12 mt-20 justify-center flex-wrap">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="font-heading text-[36px] font-extrabold leading-none" style={{ color: '#E8EDF5' }}>
                                {stat.value}<span style={{ color: '#4EFFA3' }}>{stat.suffix}</span>
                            </div>
                            <div className="text-[13px] mt-1" style={{ color: '#4A5568' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto text-center">
                <div className="text-[12px] font-semibold tracking-[3px] uppercase mb-4" style={{ color: '#4EFFA3' }}>
                    Everything you need
                </div>
                <h2
                    className="font-heading font-extrabold leading-[1.1] tracking-[-1px] mb-16 max-w-lg mx-auto"
                    style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}
                >
                    Built differently, for real results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                    {features.map((feat) => (
                        <div
                            key={feat.title}
                            className="relative rounded-[20px] p-8 transition-all duration-300 group overflow-hidden cursor-default hover:-translate-y-1"
                            style={{ background: '#0E1220', border: '1px solid #1E2535' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(78,255,163,0.3)' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1E2535' }}
                        >
                            {/* Hover gradient overlay */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]"
                                style={{ background: 'linear-gradient(135deg, rgba(78,255,163,0.05), transparent)' }}
                            />

                            <div
                                className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-5 relative z-10"
                                style={{ background: feat.iconBg }}
                            >
                                <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                            </div>
                            <h3 className="font-heading text-lg font-bold mb-2.5 relative z-10">{feat.title}</h3>
                            <p className="text-sm leading-[1.7] relative z-10" style={{ color: '#8892A4' }}>{feat.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
