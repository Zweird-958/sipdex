import { getLocales } from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources } from "./resources"

export const supportedLanguages = ["en", "fr"] as const

const DEFAULT_LANGUAGE = "en" as const

type SupportedLanguage = (typeof supportedLanguages)[number]

const getDeviceLanguage = (): SupportedLanguage => {
  const [locale] = getLocales()

  return (
    supportedLanguages.find((lang) => lang === locale.languageCode) ??
    DEFAULT_LANGUAGE
  )
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

export default i18n
