import { db } from "../../db"
import { fanta, fantaCountries } from "../../db/schema"

export const createFanta = ({
  flavour,
  imageKey,
  countryIds,
}: {
  flavour: string
  imageKey: string
  countryIds: string[]
}) =>
  db.transaction(async (tx) => {
    const [result] = await tx
      .insert(fanta)
      .values({ flavour, imageKey })
      .returning({ id: fanta.id })

    await tx.insert(fantaCountries).values(
      countryIds.map((countryId) => ({
        fantaId: result.id,
        countryId,
      })),
    )

    return result
  })
