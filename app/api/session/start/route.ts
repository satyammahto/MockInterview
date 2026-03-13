import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { adminDb, adminAuth, isAdminInitialized } from "@/lib/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helpers
async function downloadFileFromUrl(url: string) {
  console.log('[downloadFileFromUrl] Fetching:', url);
  const response = await fetch(url);
  if (!response.ok) {
    const errorDetail = `HTTP ${response.status} ${response.statusText} for URL: ${url}`;
    console.error('[downloadFileFromUrl] Failed:', errorDetail);
    throw new Error(`Failed to download file: ${errorDetail}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractDocumentText(buffer: Buffer) {
  try {
    console.log(`[Text Extract] Starting extraction on buffer of size ${buffer.length} bytes`);
    
    // Check if it's a PDF by looking at the first 4 bytes (%PDF)
    const isPDF = buffer.toString('utf8', 0, 4) === '%PDF';
    
    if (isPDF) {
      console.log(`[Text Extract] Detected format: PDF`);
      const data = await pdf(buffer);
      const text = data.text || "";
      console.log(`[Text Extract] Successfully extracted ${text.length} characters`);
      return text;
    } else {
      console.log(`[Text Extract] Detected format: non-PDF (assuming DOCX/Word)`);
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || "";
      console.log(`[Text Extract] Successfully extracted ${text.length} characters`);
      return text;
    }
  } catch (err: unknown) {
    console.error("[Text Extract] Error extracting:", err instanceof Error ? err.message : err);
    return "";
  }
}

async function callGPT(prompt: string, maxTokens = 1500, temperature = 0.6) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0].message.content?.trim() || "";
}

function extractJSONArray(text: string) {
  text = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    // Ignore parse error
  }
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]) as string[]; } catch {
      // Ignore parse error
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdminInitialized() || !adminDb || !adminAuth) {
      return NextResponse.json(
        { error: "Server not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local, then restart the server." },
        { status: 503 }
      );
    }
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
    const {
      resumeUrl,
      jobDescription,
      difficulty = "medium",
      numQuestions = 10,
      role = "",
      experience = "",
      persona = "",
    } = body;

    if (!resumeUrl || !jobDescription) {
      return NextResponse.json({ error: "resumeUrl and jobDescription are required" }, { status: 400 });
    }

    // 2. Download & parse document
    const buffer = await downloadFileFromUrl(resumeUrl);
    const resumeText = await extractDocumentText(buffer);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: "Could not extract text. Please ensure you upload a text-based PDF or DOCX, not a scanned image." }, { status: 400 });
    }

    // 3. Extract skills
    const skillsPrompt = `Extract a concise list of technical and professional skills from this resume. Return ONLY a JSON array of strings. Example: ["React", "TypeScript", "Node.js"]\nResume:\n${resumeText.slice(0, 4000)}`;
    let skillsExtracted: string[] = [];
    try {
      const skillsRaw = await callGPT(skillsPrompt, 500, 0.2);
      skillsExtracted = extractJSONArray(skillsRaw) || [];
    } catch (err) {
      console.warn("Skills extraction failed:", err);
    }

    // 4. Generate interview questions
    const skillStr = skillsExtracted.slice(0, 20).join(", ") || "software engineering";
    const questionsPrompt = `You are an expert technical interviewer. Generate exactly ${numQuestions} interview questions for this candidate.
Candidate Skills: ${skillStr}
Target Role: ${role || "Software Engineer"}
Experience Level: ${experience || "Not specified"}
Interviewer Persona: ${persona || "Professional"}
Job Description: ${jobDescription.slice(0, 2000)}
Difficulty: ${difficulty}

Requirements: Mix Technical, Behavioral, and Deep Dive questions.
IMPORTANT: Respond with ONLY a raw JSON array.
[{"text": "question text", "type": "Technical"}, ...]`;

    let questionsData: { text: string, type: string }[] = [];
    try {
      const questionsRaw = await callGPT(questionsPrompt, 2000, 0.6);
      const parsed = extractJSONArray(questionsRaw);
      if (parsed) {
        questionsData = parsed.slice(0, numQuestions).map((q: { text?: string, type?: string }) => ({
          text: String(q.text || "").trim(),
          type: String(q.type || "Technical").trim()
        }));
      }
    } catch (err) {
      console.error("Question generation error:", err);
    }

    // Fallback questions if AI generation failed
    if (questionsData.length === 0) {
      const topSkill = skillsExtracted[0] || "software development";
      questionsData = [
        { text: `Walk me through a recent project where you used ${topSkill}.`, type: "Technical" },
        { text: "Describe a time you solved a complex problem under pressure.", type: "Behavioral" },
        { text: `How would you design a scalable system using ${topSkill}?`, type: "Deep Dive" },
        { text: "Tell me about a conflict with a teammate and how you resolved it.", type: "Behavioral" },
        { text: `What are the most important best practices when working with ${topSkill}?`, type: "Technical" },
      ].slice(0, numQuestions);
    }

    // 5. Save session to Firestore
    const sessionRef = adminDb.collection("sessions").doc();
    const sessionId = sessionRef.id;

    await sessionRef.set({
      uid,
      jobDescription,
      role,
      experience,
      persona,
      difficulty,
      numQuestions,
      skillsExtracted,
      resumeUrl,
      status: "in_progress",
      overallScore: null,
      createdAt: FieldValue.serverTimestamp(),
      completedAt: null,
    });

    // 6. Save questions as subcollection
    const batch = adminDb.batch();
    const savedQuestions: { id: string, text: string, type: string, orderIndex: number }[] = [];

    questionsData.forEach((q, i) => {
      const qRef = sessionRef.collection("questions").doc();
      batch.set(qRef, {
        text: q.text,
        type: q.type,
        orderIndex: i,
        answer: null,
        score: null,
        idealAnswer: null,
        tips: [],
      });
      savedQuestions.push({ id: qRef.id, text: q.text, type: q.type, orderIndex: i });
    });

    await batch.commit();

    return NextResponse.json({
      sessionId,
      skillsExtracted,
      questions: savedQuestions,
    });

  } catch (error: unknown) {
    console.error("[/api/session/start]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
