import { db } from "../../db"
import { drinkCountries, drinks } from "../../db/schema"

export const createDrink = ({
  flavour,
  slug,
  imageKey,
  brandId,
  countryIds,
}: {
  flavour: string
  slug: string
  imageKey: string
  brandId: string
  countryIds: string[]
}) =>
  db.transaction(async (tx) => {
    const [result] = await tx
      .insert(drinks)
      .values({ flavour, slug, imageKey, brandId })
      .returning({ id: drinks.id })

    await tx.insert(drinkCountries).values(
      countryIds.map((countryId) => ({
        drinkId: result.id,
        countryId,
      })),
    )

    return result
  })
