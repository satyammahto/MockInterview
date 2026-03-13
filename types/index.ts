export interface ResumeData {
  skills: string[];
  projects: string[];
  experience: string[];
  target_role: string;
}

export interface Question {
  id: number;
  text: string;
  type: string;
  order_index: number;
  ideal_answer?: string;
}

export interface AnswerAnalysis {
  clarity_score: number;
  confidence_score: number;
  relevance_score: number;
  depth_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  filler_words: { word: string; count: number }[];
  total_filler_words: number;
  speaking_pace_wpm: number;
  pause_count: number;
}

export interface Answer {
  question_id: number;
  transcript: string;
  time_taken_seconds: number;
  analysis?: AnswerAnalysis;
}

export interface FinalReport {
  overall_score: number;
  clarity_score: number;
  confidence_score: number;
  relevance_score: number;
  depth_score: number;
  total_filler_words: number;
  avg_speaking_pace: number;
  answers: Answer[];
  strengths: string[];
  improvements: string[];
  coaching_tips: string[];
}

export interface InterviewSession {
  session_id: string;
  role: string;
  company_name?: string;
  difficulty: "easy" | "medium" | "hard";
  persona: string;
  status: "setup" | "active" | "completed";
  questions: Question[];
  answers: Answer[];
  report?: FinalReport;
}
