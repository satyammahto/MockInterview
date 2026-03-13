import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";
import { adminAuth } from "@/lib/firebaseAdmin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function downloadFileFromUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download file");
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractTextFromPDF(buffer: Buffer) {
  try {
    const data = await pdf(buffer);
    return data.text || "";
  } catch (err) {
    console.error("[PDF Extract] Error:", err);
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
    try {
      await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeUrl, role, jobDescription } = body;

    if (!resumeUrl || !role || !jobDescription) {
      return NextResponse.json({ error: "resumeUrl, role, and jobDescription are required" }, { status: 400 });
    }

    const buffer = await downloadFileFromUrl(resumeUrl);
    const resumeText = await extractTextFromPDF(buffer);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: "Could not extract text from the PDF" }, { status: 400 });
    }

    const prompt = `You are an expert Career Coach and ATS Specialist. Analyze the following resume for the role of '${role}'.

Job Description:
${jobDescription.slice(0, 1500)}

Resume:
${resumeText.slice(0, 4000)}

Evaluate across 5 dimensions and provide strengths + improvements for each.

IMPORTANT: Respond with ONLY a raw JSON object. No markdown.
{
  "score": <integer 0-100, overall match score>,
  "role": "${role}",
  "keyword_match": { "strengths": ["<strength>"], "improvements": ["<gap>"] },
  "impact": { "strengths": ["<strength>"], "improvements": ["<gap>"] },
  "grammar": { "strengths": ["<strength>"], "improvements": ["<gap>"] },
  "experience": { "strengths": ["<strength>"], "improvements": ["<gap>"] },
  "ats": { "strengths": ["<strength>"], "improvements": ["<gap>"] }
}`;

    const raw = await callGPT(prompt, 1500, 0.3);
    const result = extractJSONObject(raw);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      throw new Error("Could not parse AI response.");
    }
  } catch (error: unknown) {
    console.error("[/api/resume/analyze]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
