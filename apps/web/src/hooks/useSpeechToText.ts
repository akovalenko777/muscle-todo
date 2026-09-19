import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const capitalizeFirstLetter = (text: string): string => {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
  }

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor() as SpeechRecognition;
    recognition.continuous = true;
    recognition.lang = 'uk-UA';
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalArr = []
      for (let i = 0; i < event.results.length; i++) {
        finalArr.push(event.results[i][0].transcript.trim())
      }
      setTranscript(capitalizeFirstLetter(finalArr.join(' ')))
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  return { isListening, transcript, startListening, stopListening, isSupported, setTranscript };
}