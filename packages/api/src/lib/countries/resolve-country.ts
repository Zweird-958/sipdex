import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json" with { type: "json" }
import type { ResolvedCountry } from "../../types/countries"

const LANGUAGE = "en"

countries.registerLocale(enLocale)

export const resolveCountry = (input: string): ResolvedCountry | null => {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const upper = trimmed.toUpperCase()

  if (countries.isValid(upper)) {
    const isoCode = countries.toAlpha2(upper)
    const isoName = isoCode ? countries.getName(isoCode, LANGUAGE) : null

    if (isoCode && isoName) {
      return { name: isoName, code: isoCode }
    }
  }

  const code = countries.getAlpha2Code(trimmed, LANGUAGE)

  if (code) {
    const name = countries.getName(code, LANGUAGE)

    if (name) {
      return { name, code }
    }
  }

  return null
}
