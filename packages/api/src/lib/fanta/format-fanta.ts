import { getImageUrl } from "../../storage"
import type { FantaWithCountries } from "../../types/fanta"

export const formatFanta = (
  fanta: FantaWithCountries,
  tasted: boolean | null,
) => ({
  id: fanta.id,
  flavour: fanta.flavour,
  imageUrl: getImageUrl(fanta.imageKey),
  countries: fanta.fantaCountries
    .map((fc) => fc.country)
    .sort((a, b) => a.name.localeCompare(b.name)),
  tasted,
  createdAt: fanta.createdAt,
})
