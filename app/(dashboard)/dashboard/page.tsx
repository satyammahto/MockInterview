"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, TrendingUp, Clock, Target, Calendar, Loader2 } from "lucide-react"

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
        } catch (err: any) {
            setError(err.message || "Could not load dashboard.")
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

    // Fallback to empty state if no data
    const stats = data?.stats
    const history = data?.recent_sessions || []
    const trend = data?.performance_trend || []

    const statCards = stats
        ? [
            { label: "Int. Completed", value: String(stats.interviews_completed), icon: Activity, color: "var(--accent-1)" },
            { label: "Avg. Score", value: `${stats.avg_score}%`, icon: TrendingUp, color: "var(--accent-2)" },
            { label: "Practice Time", value: `${stats.practice_time_hours}h`, icon: Clock, color: "var(--accent-4)" },
            { label: "Goal Readiness", value: stats.goal_readiness, icon: Target, color: "var(--accent-3)" },
        ]
        : []

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-1.5">Your Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Here&apos;s a look at your interview readiness.</p>
                </div>
                <button
                    onClick={() => router.push("/upload")}
                    className="flex items-center gap-2 font-heading font-bold text-sm text-black px-5 py-2.5 rounded-lg transition-all duration-150 hover:-translate-y-px"
                    style={{ background: 'var(--accent-1)', boxShadow: '0 0 0 1px rgba(78,255,163,0.3), 0 4px 16px rgba(78,255,163,0.2)' }}
                >
                    Start Practice →
                </button>
            </div>

            {error && (
                <div className="rounded-xl px-5 py-4 text-sm font-medium text-destructive flex items-start gap-3" style={{ background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)' }}>
                    <span className="mt-0.5">⚠</span>
                    <span>{error} — Showing empty state.</span>
                </div>
            )}

            {/* Stats Grid */}
            {statCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <div key={i} className="relative rounded-2xl p-6 group hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
                            style={{ background: 'rgba(10,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at 80% 20%, ${stat.color}08 0%, transparent 60%)` }} />
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.1em]">{stat.label}</span>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}>
                                    <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div className="font-heading text-3xl font-extrabold tracking-tight" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Performance Chart */}
                <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(10,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                    <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <h2 className="font-heading text-base font-bold tracking-tight">Performance Trend</h2>
                    </div>
                    <div className="h-[280px] flex items-end justify-between px-6 pb-6 pt-4 gap-1.5 relative overflow-hidden">
                        {trend.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Complete your first interview to see trends.</p>
                            </div>
                        ) : (
                            trend.map((height, i) => (
                                <div key={i} className="w-full relative group self-end">
                                    <div
                                        className="w-full rounded-t-sm transition-all duration-200 group-hover:opacity-100 opacity-60"
                                        style={{ height: `${Math.max(height, 4)}%`, background: 'linear-gradient(to top, rgba(78,255,163,0.25), rgba(78,255,163,0.1))' }}
                                    />
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent rounded-t-sm" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="col-span-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(10,14,26,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                    <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <h2 className="font-heading text-base font-bold tracking-tight">Recent Interviews</h2>
                    </div>
                    <div className="p-4 space-y-2">
                        {history.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-10">No sessions yet.<br />Start your first practice!</p>
                        ) : (
                            history.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        localStorage.setItem("prepsense_session_id", item.session_id)
                                        router.push("/report")
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-150 cursor-pointer group hover:-translate-y-px"
                                    style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground truncate max-w-[120px] tracking-tight">{item.role}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{item.date} · {item.difficulty}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-heading font-extrabold text-base ${item.score > 85 ? 'text-accent' : item.score > 70 ? 'text-[var(--accent-4)]' : 'text-foreground'}`}>
                                            {item.score}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">/100</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
