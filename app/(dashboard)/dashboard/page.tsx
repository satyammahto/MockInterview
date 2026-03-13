"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, TrendingUp, Clock, Target, Calendar, Loader2, ArrowRight } from "lucide-react"
import { ProgressChart } from "@/components/dashboard/ProgressChart"
import { PageContainer } from "@/components/layout/PageContainer"
import { SectionHeader } from "@/components/layout/SectionHeader"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Stats {
    interviews_completed: number
    avg_score: number
    practice_time_hours: number
    goal_readiness: string
}

interface RecentSession {
    session_id: string
    role: string
    date: string
    score: number
    difficulty: string
}

interface DashboardData {
    stats: Stats
    recent_sessions: RecentSession[]
    performance_trend: number[]
}

export default function DashboardPage() {
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_BASE}/dashboard/stats`)
            if (!res.ok) throw new Error("Failed to load dashboard stats.")
            const json: DashboardData = await res.json()
            setData(json)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not load dashboard.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
                <Loader2 className="w-7 h-7 animate-spin text-accent" />
                <span className="text-sm text-muted-foreground font-medium">Loading dashboard...</span>
            </div>
        )
    }

    // Data derived state
    const history = data?.recent_sessions || []
    const stats = data?.stats
    const trend = data?.performance_trend || []
    const hasData = history.length > 0

    const statCards = stats && stats.interviews_completed > 0
        ? [
            { label: "Int. Completed", value: String(stats.interviews_completed), icon: Activity, color: "var(--accent-1)" },
            { label: "Avg. Score", value: `${stats.avg_score}%`, icon: TrendingUp, color: "var(--accent-2)" },
            { label: "Practice Time", value: `${stats.practice_time_hours}h`, icon: Clock, color: "var(--accent-4)" },
            { label: "Goal Readiness", value: stats.goal_readiness, icon: Target, color: "var(--accent-3)" },
        ]
        : []

    return (
        <PageContainer>
            <SectionHeader 
                title="Dashboard" 
                description="Monitor your interview performance and track your growth."
            >
                {hasData && (
                    <button
                        onClick={() => router.push("/upload")}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-heading font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Start New Practice →
                    </button>
                )}
            </SectionHeader>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-[32px] text-center px-6 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                        <Target className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-extrabold mb-3">Level up your interview game</h2>
                    <p className="text-muted-foreground max-w-md mb-10 text-balance">
                        Start your first practice session to get AI-powered insights, technical scoring, and track your readiness for real interviews.
                    </p>
                    <button
                        onClick={() => router.push("/upload")}
                        className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-heading font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Start Your First Interview <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">AI-Powered · Real-time Feedback · Personalized</p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--component-gap)] mb-[var(--section-gap)]">
                        {statCards.map((stat, i) => (
                            <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50">
                                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                                    </div>
                                </div>
                                <div className="font-heading text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--section-gap)]">
                        {/* Performance Chart */}
                        <div className="lg:col-span-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="px-6 py-5 border-b border-border">
                                <h2 className="text-base">Performance Trend</h2>
                            </div>
                            <div className="flex-1 min-h-[320px] p-6 relative">
                                {trend.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                                        Complete your first interview to see trends.
                                    </div>
                                ) : (
                                    <ProgressChart 
                                        data={trend.map((score, i) => ({
                                            date: history[history.length - 1 - i]?.date || `Session ${i+1}`,
                                            score: score,
                                            role: history[history.length - 1 - i]?.role || 'Mock Interview'
                                        }))} 
                                    />
                                )}
                            </div>
                        </div>

                        {/* History List */}
                        <div className="lg:col-span-4 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="px-6 py-5 border-b border-border">
                                <h2 className="text-base">Recent Activity</h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {history.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            localStorage.setItem("prepsense_session_id", item.session_id)
                                            router.push("/report")
                                        }}
                                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-muted/50 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold truncate max-w-[150px]">{item.role}</div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">{item.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-heading font-extrabold text-primary">{item.score}%</div>
                                            <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">{item.difficulty}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </PageContainer>
    )
}
