import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

interface HookParams {
  onEnd?: (s: string) => void
}

const capitalizeFirstLetter = (text: string): string => {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

export function useSpeechToText({ onEnd }: HookParams = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onEndRef = useRef(onEnd)
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const startListening = useCallback((isCapitalize = true) => {
    if (!isSupported || isListening) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor() as SpeechRecognition
    recognition.continuous = true
    recognition.lang = 'uk-UA'
    recognition.interimResults = true
    let sessionText = ''

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const finalArr = []
      for (let i = 0; i < event.results.length; i++) {
        finalArr.push(event.results[i][0].transcript.trim())
      }
      sessionText = isCapitalize
        ? capitalizeFirstLetter(finalArr.join(' '))
        : finalArr.join(' ')
      setTranscript(sessionText)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      onEndRef.current?.(sessionText)
    };

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }, [isSupported, isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  useEffect(() => { onEndRef.current = onEnd })

  return { isListening, transcript, startListening, stopListening, isSupported, setTranscript }
}