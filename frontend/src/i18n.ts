import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationPL from './locales/pl.json'
import translationEN from './locales/en.json'

const resources = {
  pl: {
    translation: translationPL,
  },
  en: {
    translation: translationEN,
  },
}

const savedLang = localStorage.getItem('i18nextLng') || 'pl'

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'pl',
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
})

export default i18n
