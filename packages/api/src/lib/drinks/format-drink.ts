import { getImageUrl } from "../../storage"
import type { DrinkWithRelations } from "../../types/drinks"

export const formatDrink = (
  drink: DrinkWithRelations,
  tasted: boolean | null,
) => ({
  id: drink.id,
  flavour: drink.flavour,
  imageUrl: getImageUrl(drink.imageKey),
  brand: {
    id: drink.brand.id,
    name: drink.brand.name,
    logoUrl: getImageUrl(drink.brand.logoKey),
  },
  countries: drink.drinkCountries
    .map((dc) => dc.country)
    .sort((a, b) => a.name.localeCompare(b.name)),
  tasted,
  createdAt: drink.createdAt,
})
