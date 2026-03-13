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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    // Fallback to empty state if no data
    const stats = data?.stats
    const history = data?.recent_sessions || []
    const trend = data?.performance_trend || []

    const statCards = stats
        ? [
            { label: "Int. Completed", value: String(stats.interviews_completed), icon: Activity, metric: "" },
            { label: "Avg. Score", value: `${stats.avg_score}%`, icon: TrendingUp, metric: "" },
            { label: "Practice Time", value: `${stats.practice_time_hours}h`, icon: Clock, metric: "" },
            { label: "Goal Readiness", value: stats.goal_readiness, icon: Target, metric: "" },
        ]
        : []

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Your Dashboard</h1>
                    <p className="text-muted-foreground">Here&apos;s a look at your interview readiness.</p>
                </div>
                <button
                    onClick={() => router.push("/upload")}
                    className="bg-accent text-black font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-transform hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(78,255,163,0.25)]"
                >
                    Start Practice
                </button>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
                    {error} — Showing empty state.
                </div>
            )}

            {/* Stats Grid */}
            {statCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <Card key={i} className="bg-surface border-border hover:border-accent/40 transition-colors group">
                            <CardHeader className="pl-6 pt-6 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                                <div className="p-2 bg-secondary rounded-lg group-hover:bg-accent/10 transition-colors">
                                    <stat.icon className="w-4 h-4 text-foreground group-hover:text-accent" />
                                </div>
                            </CardHeader>
                            <CardContent className="pl-6 pb-6 pt-0">
                                <div className="font-heading text-3xl font-extrabold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <Card className="col-span-1 lg:col-span-2 bg-surface border-border">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Performance Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-end justify-between px-8 pb-6 gap-2 border-t border-border/50 relative overflow-hidden">
                        {trend.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Complete your first interview to see trends.</p>
                            </div>
                        ) : (
                            trend.map((height, i) => (
                                <div key={i} className="w-full relative group self-end">
                                    <div
                                        className="w-full bg-accent/20 rounded-t-sm group-hover:bg-accent/40 transition-colors"
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                    />
                                    <div className="absolute top-0 left-0 w-full h-1 bg-accent rounded-t-sm group-hover:h-2 transition-all" />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* History List */}
                <Card className="col-span-1 bg-surface border-border">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Recent Interviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {history.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">No sessions yet.<br />Start your first practice!</p>
                        ) : (
                            history.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        localStorage.setItem("prepsense_session_id", item.session_id)
                                        router.push("/report")
                                    }}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-secondary/20 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-background transition-colors">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground truncate max-w-[120px]">{item.role}</div>
                                            <div className="text-xs text-muted-foreground">{item.date} · {item.difficulty}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-heading font-extrabold text-sm ${item.score > 85 ? 'text-accent' : item.score > 70 ? 'text-[var(--accent-4)]' : 'text-foreground'}`}>
                                            {item.score}
                                        </div>
                                        <div className="text-xs text-muted-foreground">/100</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
