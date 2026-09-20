import { Page } from '@playwright/test';

export async function mockSpeechRecognition(page: Page, dictatedText: string) {
  await page.addInitScript((text) => {
    class FakeSpeechRecognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
      onerror: ((event: SpeechRecognitionEvent) => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        setTimeout(()=>{
          const results = [[{ transcript: text, confidence: 0.9, isFinal: true }] as unknown as SpeechRecognitionResult];
          this.onresult?.({ results } as unknown as SpeechRecognitionEvent)
        }, 200)
      }

      stop() {
        this.onend?.()
      }

      abort() {
        this.onend?.();
      }
    }

    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeSpeechRecognition;
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = FakeSpeechRecognition;
  }, dictatedText);
}