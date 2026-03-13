import { create } from "zustand";
import { Question, AnswerAnalysis, InterviewSession } from "@/types";

interface InterviewState {
  sessionId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<number, AnswerAnalysis>;
  isRecording: boolean;
  isAISpeaking: boolean;
  
  // Actions
  setSession: (id: string, questions: Question[]) => void;
  setCurrentQuestion: (index: number) => void;
  addAnswerAnalysis: (questionId: number, analysis: AnswerAnalysis) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsAISpeaking: (isAISpeaking: boolean) => void;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: "",
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  isRecording: false,
  isAISpeaking: false,

  setSession: (id, questions) => 
    set({ sessionId: id, questions, currentQuestionIndex: 0, answers: new Map() }),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  addAnswerAnalysis: (questionId, analysis) =>
    set((state) => {
      const newAnswers = new Map(state.answers);
      newAnswers.set(questionId, analysis);
      return { answers: newAnswers };
    }),

  setIsRecording: (isRecording) => set({ isRecording }),

  setIsAISpeaking: (isAISpeaking) => set({ isAISpeaking }),

  resetSession: () => 
    set({ 
      sessionId: "", 
      questions: [], 
      currentQuestionIndex: 0, 
      answers: new Map(),
      isRecording: false,
      isAISpeaking: false
    })
}));
