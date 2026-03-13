"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Info, Zap } from "lucide-react";

interface EvaluationResult {
  communication_score: number;
  grammar_score: number;
  technical_score: number;
  star_structure_score: number;
  overall_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  star_details: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
}

interface AnswerEvaluationCardProps {
  evaluation: EvaluationResult | null;
  loading: boolean;
}

const ScoreBar = ({ label, score, max = 10 }: { label: string; score: number; max?: number }) => {
  const percentage = (score / max) * 100;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span>{score}/{max}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const AnswerEvaluationCard: React.FC<AnswerEvaluationCardProps> = ({ evaluation, loading }) => {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5 animate-pulse">
        <CardContent className="h-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-6 w-6 text-primary animate-bounce" />
            <p className="text-sm font-medium text-muted-foreground">AI is evaluating your answer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evaluation) return null;

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            AI Answer Analysis
          </CardTitle>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            Score: {evaluation.overall_score}/100
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-4">
          <ScoreBar label="Communication" score={evaluation.communication_score} />
          <ScoreBar label="Technical Accuracy" score={evaluation.technical_score} />
          <ScoreBar label="Confidence" score={evaluation.confidence_score} />
          <ScoreBar label="STAR Structure" score={evaluation.star_structure_score} />
          
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">STAR:</span>
            <div className="flex gap-1.5">
              {Object.entries(evaluation.star_details).map(([key, val]) => (
                <div 
                  key={key} 
                  className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                    val ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                  title={key}
                >
                  {key[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold flex items-center gap-1 text-green-600 dark:text-green-400 mb-1.5">
              <CheckCircle2 className="h-3 w-3" /> Strengths
            </h4>
            <ul className="text-sm space-y-1">
              {evaluation.strengths.slice(0, 2).map((s, i) => (
                <li key={i} className="flex gap-2 items-start text-muted-foreground">
                  <span className="text-primary mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold flex items-center gap-1 text-amber-600 dark:text-amber-400 mb-1.5">
              <AlertCircle className="h-3 w-3" /> Improvements
            </h4>
            <ul className="text-sm space-y-1">
              {evaluation.improvement_suggestions.slice(0, 2).map((s, i) => (
                <li key={i} className="flex gap-2 items-start text-muted-foreground">
                  <span className="text-amber-500 mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
