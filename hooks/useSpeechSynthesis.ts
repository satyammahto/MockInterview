import { useState, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  const speak = useCallback((text: string, forceFallback = false) => {
    if (!synthRef.current) return;

    // Stop anything currently speaking
    synthRef.current.cancel();

    // The user wants Next.js native TTS with ElevenLabs but falling back to window.speechSynthesis
    // For now, in MVP mode, we'll try window.speechSynthesis directly.
    // The FastAPI backend already has ElevenLabs integration at `/api/tts/synthesize`!
    // Since we are leveraging FastAPI, we can try fetching from FastAPI first,
    // and if it fails, fallback here.
    
    // BUT the standard use case for text-to-speech in this hook:
    // We will do browser synthesis as the default local fallback if the API fails.

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose a professional voice if available
    const voices = synthRef.current.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      // Try to get a Google US or UK voice, else just the first English one
      const preferred = englishVoices.find(v => v.name.includes("Google") || v.name.includes("Siri")) || englishVoices[0];
      utterance.voice = preferred;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis failed", e);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking
  };
}
