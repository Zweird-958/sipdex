import type { CountrySummary } from "./countries"

export type FantaWithCountries = {
  id: string
  flavour: string
  imageKey: string
  createdAt: Date
  fantaCountries: {
    country: CountrySummary
  }[]
}
