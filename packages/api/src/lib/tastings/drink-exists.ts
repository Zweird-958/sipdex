import { db } from "../../db"

export const drinkExists = async (id: string) => {
  const drinkResult = await db.query.drinks.findFirst({
    where: (d, operators) => operators.eq(d.id, id),
  })

  return Boolean(drinkResult)
}
