// Convert an ISO 3166-1 alpha-2 country code (e.g. "FR") into its flag emoji
// by mapping each letter to its Regional Indicator Symbol.
const REGIONAL_INDICATOR_OFFSET = 127397

export const countryCodeToFlag = (code: string) =>
  Array.from(code.toUpperCase(), (char) =>
    String.fromCodePoint(REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0)),
  ).join("")
