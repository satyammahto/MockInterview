import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractJSONArray(text: string) {
  text = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  try { return JSON.parse(text); } catch {
    // ignore
  }
  const match = text.match(/\[[\s\S]*\]/);
  if (match) { try { return JSON.parse(match[0]); } catch {
      // ignore
  } }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const sessionRef = adminDb?.collection("sessions").doc(sessionId);
    const sessionDoc = await sessionRef?.get();
    
    if (!sessionDoc?.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const qSnapshot = await sessionRef?.collection("questions").orderBy("orderIndex").get();
    const questions = qSnapshot?.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })) || [];

    // Evaluate answers using OpenAI
    let totalScore = 0;
    let scoredCount = 0;

    for (const q of questions) {
      if (!q.answer || q.answer.length < 5) continue; // Skip un-answered questions

      const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
Question: ${q.text}
Candidate's Answer: ${q.answer}
Target Role: ${sessionData?.role || "Software Engineer"}
Experience Level: ${sessionData?.experience || "Fresher"}

Requirements:
Evaluate the answer critically. Give a score out of 10. Write what the ideal answer should have been. Briefly point out 2-3 specific tips.
IMPORTANT: Respond with ONLY a single raw JSON array containing exactly one object:
[{"score": 8, "idealAnswer": "Should have mentioned X and Y...", "tips": ["Mention X", "Be concise"]}]`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.3,
        });

        const raw = response.choices[0].message.content || "";
        const parsed = extractJSONArray(raw)?.[0];
        
        if (parsed) {
          await sessionRef?.collection("questions").doc(q.id).update({
            score: parsed.score || 0,
            idealAnswer: parsed.idealAnswer || "",
            tips: parsed.tips || [],
          });
          totalScore += parsed.score || 0;
          scoredCount++;
        }
      } catch (err) {
        console.error("Error evaluating question", q.id, err);
      }
    }

    const overallScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    await sessionRef?.update({
      status: "completed",
      overallScore,
      completedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, overallScore });
  } catch (err: unknown) {
    console.error("[/api/sessions/generate-report] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
