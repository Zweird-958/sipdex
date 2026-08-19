import { db } from "../../db"
import type { DrinkWithRelations } from "../../types/drinks"
import { tastedIdsForUser } from "../tastings/tasted-ids-for-user"
import { formatDrink } from "./format-drink"

export const listDrinks = async (userId?: string) => {
  const result = (await db.query.drinks.findMany({
    with: {
      brand: { columns: { id: true, name: true, logoKey: true } },
      drinkCountries: {
        with: { country: { columns: { name: true, code: true } } },
      },
    },
    orderBy: (d, { asc }) => asc(d.id),
  })) as DrinkWithRelations[]

  const tastedIds = await tastedIdsForUser(
    userId,
    result.map((r) => r.id),
  )

  return result.map((r) =>
    formatDrink(r, userId ? tastedIds.includes(r.id) : null),
  )
}
