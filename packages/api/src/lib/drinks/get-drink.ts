import { db } from "../../db"
import { tastedIdsForUser } from "../tastings/tasted-ids-for-user"
import { formatDrink } from "./format-drink"

export const getDrink = async (id: string, userId?: string) => {
  const drinkResult = await db.query.drinks.findFirst({
    with: {
      brand: { columns: { id: true, name: true, logoKey: true } },
      drinkCountries: {
        with: { country: { columns: { name: true, code: true } } },
      },
    },
    where: (d, { eq }) => eq(d.id, id),
  })

  if (!drinkResult) {
    return null
  }

  const tastedIds = await tastedIdsForUser(userId, [drinkResult.id])

  return formatDrink(
    drinkResult,
    userId ? tastedIds.includes(drinkResult.id) : null,
  )
}
