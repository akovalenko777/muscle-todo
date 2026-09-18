import { Page } from '@playwright/test';

export async function mockSpeechRecognition(page: Page, dictatedText: string) {
  await page.addInitScript((text) => {
    class FakeSpeechRecognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = '';
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;

      start() {
        // питання: скільки часу варто "симулювати" затримку розпізнавання
        // (setTimeout), і що станеться з тестом, якщо взагалі прибрати затримку —
        // чи React встигне обробити подію синхронно?
        setTimeout(()=>{
          this.onresult?.({ results: [[{ transcript: text }]] } as any)
        }, 200)
      }

      stop() {
        this.onend?.()
      }

      abort() {
        this.onend?.();
      }
    }

    (window as any).SpeechRecognition = FakeSpeechRecognition;
    (window as any).webkitSpeechRecognition = FakeSpeechRecognition;
  }, dictatedText);
}