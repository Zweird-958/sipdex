import type { BrandSummary } from "./brands"
import type { CountrySummary } from "./countries"

export type DrinkWithRelations = {
  id: string
  flavour: string
  imageKey: string
  createdAt: Date
  brand: BrandSummary
  drinkCountries: {
    country: CountrySummary
  }[]
}
