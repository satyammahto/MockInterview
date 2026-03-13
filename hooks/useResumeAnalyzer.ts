"use client";

import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";

interface AnalysisSection {
  strengths: string[];
  improvements: string[];
}

interface AnalysisResult {
  score: number;
  role: string;
  keyword_match: AnalysisSection;
  impact: AnalysisSection;
  grammar: AnalysisSection;
  experience: AnalysisSection;
  ats: AnalysisSection;
}

export function useResumeAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = useCallback(async (
    resumeUrl: string,
    role: string,
    jobDescription: string
  ): Promise<AnalysisResult | null> => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("You must be logged in to analyze a resume.");
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(100);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeUrl, role, jobDescription })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Resume analysis failed");
      }

      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resume analysis failed.";
      setError(msg);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyzeResume, isAnalyzing, uploadProgress, error };
}
