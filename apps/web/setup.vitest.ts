import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationUA from './src/locale/uk.json' with { type: 'json' }

vi.mock('zustand')

// Real i18next with the uk resources (not src/i18n.ts, to skip the browser language detector),
// so specs assert on the actual Ukrainian text and a missing key fails the test.
i18n.use(initReactI18next).init({
  lng: 'uk',
  fallbackLng: 'uk',
  resources: { uk: { translation: translationUA } },
  interpolation: { escapeValue: false },
})
