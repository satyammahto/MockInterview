"use client";

import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";

interface Question {
  id: string;
  text: string;
  type: string;
  orderIndex: number;
}

interface StartSessionResult {
  sessionId: string;
  skillsExtracted: string[];
  questions: Question[];
}

interface StartSessionInput {
  resumeUrl: string;   // changed
  jobDescription: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions?: number;
  role?: string;
  experience?: string;
  persona?: string;
}

export function useSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (input: StartSessionInput): Promise<StartSessionResult | null> => {
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setError("You must be logged in to start a session.");
        return null;
      }

      setIsLoading(true);
      setError(null);
      setUploadProgress(100); // already uploaded

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not authenticated");
        const response = await fetch("/api/session/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            resumeUrl: input.resumeUrl,
            jobDescription: input.jobDescription,
            difficulty: input.difficulty,
            numQuestions: input.numQuestions ?? 10,
            role: input.role ?? "",
            experience: input.experience ?? "",
            persona: input.persona ?? "",
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to start session");
        }

        return data;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { startSession, isLoading, uploadProgress, error };
}