import AsyncStorage from "@react-native-async-storage/async-storage"
import { colorScheme } from "nativewind"
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useTranslation } from "react-i18next"

export type ThemeChoice = "system" | "light" | "dark"
export type LanguageChoice = "en" | "fr"

const STORAGE_KEYS = {
  theme: "sipdex.theme",
  language: "sipdex.language",
}

const THEME_CHOICES: ThemeChoice[] = ["system", "light", "dark"]
const LANGUAGE_CHOICES: LanguageChoice[] = ["en", "fr"]

type SettingsContextValue = {
  theme: ThemeChoice
  language: LanguageChoice
  setTheme: (theme: ThemeChoice) => void
  setLanguage: (language: LanguageChoice) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation()

  // Defaults come from the device: theme follows the system, language is the
  // one i18n resolved from the device locale on init.
  const [theme, setThemeState] = useState<ThemeChoice>("system")
  const [language, setLanguageState] = useState<LanguageChoice>(
    i18n.language === "fr" ? "fr" : "en",
  )

  // Restore the user's saved choices (if any) on launch and apply them.
  useEffect(() => {
    void (async () => {
      const [savedTheme, savedLanguage] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.theme),
        AsyncStorage.getItem(STORAGE_KEYS.language),
      ])

      if (THEME_CHOICES.includes(savedTheme as ThemeChoice)) {
        setThemeState(savedTheme as ThemeChoice)
        colorScheme.set(savedTheme as ThemeChoice)
      }

      if (LANGUAGE_CHOICES.includes(savedLanguage as LanguageChoice)) {
        setLanguageState(savedLanguage as LanguageChoice)
        void i18n.changeLanguage(savedLanguage as LanguageChoice)
      }
    })()
  }, [i18n])

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next)
    colorScheme.set(next)
    void AsyncStorage.setItem(STORAGE_KEYS.theme, next)
  }, [])

  const setLanguage = useCallback(
    (next: LanguageChoice) => {
      setLanguageState(next)
      void i18n.changeLanguage(next)
      void AsyncStorage.setItem(STORAGE_KEYS.language, next)
    },
    [i18n],
  )

  return (
    <SettingsContext.Provider
      value={{ theme, language, setTheme, setLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }

  return context
}
