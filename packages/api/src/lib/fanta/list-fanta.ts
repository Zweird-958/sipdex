import { db } from "../../db"
import type { FantaWithCountries } from "../../types/fanta"
import { tastedIdsForUser } from "../tastings/tasted-ids-for-user"
import { formatFanta } from "./format-fanta"

export const listFanta = async (userId?: string) => {
  const result = (await db.query.fanta.findMany({
    with: {
      fantaCountries: {
        with: { country: { columns: { name: true, code: true } } },
      },
    },
    orderBy: (f, { asc }) => asc(f.id),
  })) as FantaWithCountries[]

  const tastedIds = await tastedIdsForUser(
    userId,
    result.map((r) => r.id),
  )

  return result.map((r) =>
    formatFanta(r, userId ? tastedIds.includes(r.id) : null),
  )
}
