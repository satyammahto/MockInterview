# Services package — lazy imports only to prevent startup crashes
# Individual service functions are imported directly in each module that uses them.
# Do NOT add eager imports here for heavy dependencies (TTS, ML models, etc.)

__all__ = [
    "extract_skills",
    "generate_questions",
    "generate_followup_question",
    "transcribe_audio",
    "synthesize_speech",
    "evaluate_answer",
    "generate_overall_feedback",
]
