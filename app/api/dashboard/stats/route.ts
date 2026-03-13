import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // In a production app, verify the user token here via headers
    // For this migration, we fetch recent sessions globally or default data
    const snapshot = await adminDb?.collection("sessions").orderBy("createdAt", "desc").limit(10).get();
    
    let interviews_completed = 0;
    let sum_scores = 0;
    const recent_sessions: Record<string, unknown>[] = [];
    const performance_trend: number[] = [];

    snapshot?.docs.forEach(doc => {
       const data = doc.data();
       if (data.status === "completed" || data.overallScore) {
           interviews_completed++;
           sum_scores += data.overallScore || 0;
           performance_trend.push(data.overallScore || 0);
       }
       recent_sessions.push({
           session_id: doc.id,
           role: data.role || "Software Engineer",
           date: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
           score: data.overallScore || 0,
           difficulty: data.difficulty || "medium"
       });
    });

    performance_trend.reverse(); // Show oldest to newest

    return NextResponse.json({
        stats: {
            interviews_completed,
            avg_score: interviews_completed > 0 ? Math.round(sum_scores / interviews_completed) : 0,
            practice_time_hours: Math.round((interviews_completed * 15) / 60) || 0, // Roughly 15 mins per interview
            goal_readiness: interviews_completed > 3 ? "On Track" : "Needs Practice"
        },
        recent_sessions,
        performance_trend
    });
  } catch(err: unknown) {
    console.error("[/api/dashboard/stats] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
