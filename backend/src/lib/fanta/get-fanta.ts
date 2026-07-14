import { db } from "../../db"
import { tastedIdsForUser } from "../tastings/tasted-ids-for-user"
import { formatFanta } from "./format-fanta"

export const getFanta = async (id: string, userId?: string) => {
  const fantaResult = await db.query.fanta.findFirst({
    with: {
      fantaCountries: {
        with: { country: { columns: { name: true, code: true } } },
      },
    },
    where: (f, { eq }) => eq(f.id, id),
  })

  if (!fantaResult) {
    return null
  }

  const tastedIds = await tastedIdsForUser(userId, [fantaResult.id])

  return formatFanta(fantaResult, tastedIds.includes(fantaResult.id))
}
