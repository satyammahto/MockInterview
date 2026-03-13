import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { question_id, transcript, time_taken_seconds } = body;

    if (!question_id || !transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionRef = adminDb?.collection("sessions").doc(sessionId);
    const qRef = sessionRef?.collection("questions").doc(question_id);

    await qRef?.update({
      answer: transcript,
      timeTaken: time_taken_seconds || 0,
    });

    // We can confidently return no followup to move cleanly to the next question
    return NextResponse.json({ success: true, followup_question: null });
  } catch (err: unknown) {
    console.error("[/api/sessions/answers] Error saving answer:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
