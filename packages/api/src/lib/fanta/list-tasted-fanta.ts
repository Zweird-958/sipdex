import { db } from "../../db"
import { formatFanta } from "./format-fanta"

export const listTastedFanta = async (userId: string) => {
  const tasted = await db.query.tastings.findMany({
    columns: { fantaId: true, tastedAt: true },
    with: {
      fanta: {
        with: {
          fantaCountries: {
            with: { country: { columns: { name: true, code: true } } },
          },
        },
      },
    },
    where: (t, { eq }) => eq(t.userId, userId),
    orderBy: (t, { asc }) => asc(t.fantaId),
  })

  if (tasted.length === 0) {
    return []
  }

  return tasted.map((t) => formatFanta(t.fanta, true))
}
