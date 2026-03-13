"use client";

import { useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface FeedbackItem {
  questionId: string;
  questionText: string;
  questionType: string;
  score: number;
  yourAnswer: string;
  idealAnswer: string;
  tips: string[];
}

interface ReportResult {
  overallScore: number;
  metrics: { confidence: number; clarity: number; relevance: number; pacing: number };
  feedback: FeedbackItem[];
  strengths: string[];
  improvements: string[];
  advice: string[];
  summaryMessage: string;
}

export function useReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Save the transcript/answer for a single question to Firestore. */
  const saveAnswer = useCallback(async (sessionId: string, questionId: string, transcript: string) => {
    try {
      const questionRef = doc(db, "sessions", sessionId, "questions", questionId);
      await setDoc(questionRef, { answer: transcript }, { merge: true });
    } catch (err) {
      console.error("[useReport] saveAnswer error:", err);
    }
  }, []);

  /** Call the generateReport Cloud Function. Returns report data. */
  const generateReport = useCallback(async (sessionId: string): Promise<ReportResult | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }
      
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate report.";
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /** Fetch an already-generated report from Firestore (for the /report page). */
  const fetchReport = useCallback(async (sessionId: string): Promise<ReportResult | null> => {
    try {
      const reportSnap = await getDoc(doc(db, "reports", sessionId));
      if (!reportSnap.exists()) return null;
      const data = reportSnap.data();
      return {
        overallScore: data.overallScore,
        metrics: {
          confidence: data.confidenceScore,
          clarity: data.clarityScore,
          relevance: data.relevanceScore,
          pacing: data.pacingScore,
        },
        feedback: data.feedback ?? [],
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        advice: data.advice ?? [],
        summaryMessage: data.summaryMessage ?? "",
      };
    } catch (err) {
      console.error("[useReport] fetchReport error:", err);
      return null;
    }
  }, []);

  return { generateReport, saveAnswer, fetchReport, isGenerating, error };
}
