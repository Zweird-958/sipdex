import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import frLocale from "i18n-iso-countries/langs/fr.json"

countries.registerLocale(enLocale)
countries.registerLocale(frLocale)

// Localised country name for an ISO 3166-1 alpha-2 code (e.g. "FR" -> "France"
// / "France", "ES" -> "Spain" / "Espagne"). Falls back to the raw code.
export const getCountryName = (code: string, language: string) =>
  countries.getName(code, language) ?? code
