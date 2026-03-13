import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callGPT(prompt: string, maxTokens = 1500, temperature = 0.6) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0].message.content?.trim() || "";
}

function extractJSONObject(text: string) {
  text = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]) as Record<string, unknown>; } catch {
      // ignore
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const uid = decodedToken.uid;

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Load session
    const sessionRef = adminDb.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    if (sessionSnap.data()?.uid !== uid) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Load questions
    const questionsSnap = await sessionRef.collection("questions").orderBy("orderIndex").get();
    if (questionsSnap.empty) {
      return NextResponse.json({ error: "No questions found for this session." }, { status: 400 });
    }

    // Evaluate each answer
    const qaPairs: { question: string, type: string, answer: string, score: number }[] = [];
    const feedbackItems: Record<string, unknown>[] = [];
    const updateBatch = adminDb.batch();

    // Note: We use a classic for-loop since we have `await` inside
    for (const qDoc of questionsSnap.docs) {
      const q = qDoc.data();
      const transcript = q.answer || "";

      let evaluation = { score: 0, idealAnswer: "No answer was given.", tips: ["Please answer all questions."], feedback: "No answer recorded." };

      if (transcript && transcript.trim().length >= 10) {
        const evalPrompt = `You are an expert interview coach evaluating a candidate's answer.
Question Type: ${q.type}\nQuestion: ${q.text}\nCandidate's Answer: ${transcript}
Evaluate based on: technical accuracy, communication clarity, relevance, structure (STAR for behavioral).
IMPORTANT: Respond with ONLY a raw JSON object. No markdown.
{
  "score": <integer 0-100>,
  "idealAnswer": "<concise model answer 3-5 sentences>",
  "tips": ["<tip 1>", "<tip 2>"],
  "feedback": "<1-2 sentence summary>"
}`;
        try {
          const raw = await callGPT(evalPrompt, 700, 0.3);
          const parsed = extractJSONObject(raw);
          if (parsed) evaluation = parsed as typeof evaluation;
        } catch (err) {
          console.error("[generateReport] Eval error:", err);
        }
      }

      updateBatch.update(qDoc.ref, {
        score: evaluation.score ?? 0,
        idealAnswer: evaluation.idealAnswer ?? "",
        tips: evaluation.tips ?? [],
        feedback: evaluation.feedback ?? "",
      });

      qaPairs.push({ question: q.text, type: q.type, answer: transcript, score: evaluation.score ?? 0 });
      feedbackItems.push({
        questionId: qDoc.id,
        questionText: q.text,
        questionType: q.type,
        score: evaluation.score ?? 0,
        yourAnswer: transcript,
        idealAnswer: evaluation.idealAnswer ?? "",
        tips: evaluation.tips ?? [],
      });
    }

    await updateBatch.commit();

    // Generate overall feedback
    const avgScore = qaPairs.reduce((sum, p) => sum + (p.score || 0), 0) / Math.max(qaPairs.length, 1);
    const qaSummary = qaPairs.map((p, i) => `Q${i + 1} [${p.type}] Score:${p.score}/100 — ${p.question.slice(0, 120)}`).join("\n");

    const overallPrompt = `You are an expert interview coach providing a holistic assessment of a mock interview session.
Average Score: ${avgScore.toFixed(0)}/100
Skills: ${(sessionSnap.data()?.skillsExtracted || []).slice(0, 10).join(", ") || "general"}
Q&A Summary:
${qaSummary}

IMPORTANT: Respond with ONLY a raw JSON object. No markdown.
{
  "overallScore": <integer 0-100>,
  "confidenceScore": <integer 0-100>,
  "clarityScore": <integer 0-100>,
  "relevanceScore": <integer 0-100>,
  "pacingScore": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "advice": ["<advice 1>", "<advice 2>", "<advice 3>"],
  "summaryMessage": "<2-3 sentence motivational summary>"
}`;

    let overall = {
      overallScore: Math.round(avgScore),
      confidenceScore: Math.min(Math.round(avgScore * 1.1), 100),
      clarityScore: Math.round(avgScore),
      relevanceScore: Math.round(avgScore),
      pacingScore: 72,
      strengths: ["Engaged with all questions", "Showed effort in responses"],
      improvements: ["Continue practicing", "Focus on structuring answers clearly"],
      advice: ["Review ideal answers", "Practice the STAR method"],
      summaryMessage: "Good effort! Keep practicing to improve your interview performance.",
    };

    try {
      const raw = await callGPT(overallPrompt, 900, 0.4);
      const parsed = extractJSONObject(raw);
      if (parsed) overall = parsed as typeof overall;
    } catch (err) {
      console.error("[generateReport] Overall feedback error:", err);
    }

    // Save report to Firestore
    const reportRef = adminDb.collection("reports").doc(sessionId);
    await reportRef.set({
      uid,
      sessionId,
      ...overall,
      feedback: feedbackItems,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update session status
    await sessionRef.update({
      status: "completed",
      overallScore: overall.overallScore,
      completedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      overallScore: overall.overallScore,
      metrics: {
        confidence: overall.confidenceScore,
        clarity: overall.clarityScore,
        relevance: overall.relevanceScore,
        pacing: overall.pacingScore,
      },
      feedback: feedbackItems,
      strengths: overall.strengths,
      improvements: overall.improvements,
      advice: overall.advice,
      summaryMessage: overall.summaryMessage,
    });

  } catch (error: unknown) {
    console.error("[/api/report/generate]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
