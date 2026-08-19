import { db } from "../../db"
import { formatDrink } from "./format-drink"

export const listTastedDrinks = async (userId: string) => {
  const tasted = await db.query.tastings.findMany({
    columns: { drinkId: true, tastedAt: true },
    with: {
      drink: {
        with: {
          brand: { columns: { id: true, name: true, logoKey: true } },
          drinkCountries: {
            with: { country: { columns: { name: true, code: true } } },
          },
        },
      },
    },
    where: (t, { eq }) => eq(t.userId, userId),
    orderBy: (t, { asc }) => asc(t.drinkId),
  })

  if (tasted.length === 0) {
    return []
  }

  return tasted.map((t) => formatDrink(t.drink, true))
}
