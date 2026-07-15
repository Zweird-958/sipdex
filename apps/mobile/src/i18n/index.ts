import { getLocales } from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources } from "./resources"

export const supportedLanguages = ["en", "fr"] as const

type SupportedLanguage = (typeof supportedLanguages)[number]

const getDeviceLanguage = (): SupportedLanguage => {
  const [locale] = getLocales()

  return supportedLanguages.find((lang) => lang === locale.languageCode) ?? "en"
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

export default i18n
