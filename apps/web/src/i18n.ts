import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locale/en.json' with { type: "json" };
import translationUA from './locale/uk.json' with { type: "json" };

export type TLang = 'en' | 'uk'

export interface ILangs {
  code: TLang
  name: string
  shortName: string
}

export const langOptions: ILangs[] = [
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
  },
  {
    code: 'uk',
    name: 'Українська',
    shortName: 'UK',
  }
]

const resources: Record<TLang, Resource> = {
  en: {
    translation: translationEN
  },
  uk: {
    translation: translationUA
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'uk',
    debug: true,
    resources,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n