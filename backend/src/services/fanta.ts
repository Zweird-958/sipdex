import { db } from "../db"
import { fanta, fantaCountries } from "../db/schema"
import { formatFanta } from "../lib/fanta"
import type { FantaWithCountries } from "../types/fanta"
import { tastedIdsForUser } from "./tastings"

const fantaQueryConfig = {
  with: {
    fantaCountries: {
      with: { country: { columns: { name: true, code: true } } },
    },
  },
} as const

export const listFanta = async (userId?: string) => {
  const result = (await db.query.fanta.findMany({
    ...fantaQueryConfig,
    orderBy: (f, { asc }) => asc(f.id),
  })) as FantaWithCountries[]

  const tastedIds = await tastedIdsForUser(
    userId,
    result.map((r) => r.id),
  )

  return result.map((r) => formatFanta(r, tastedIds.includes(r.id)))
}

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

export const getFanta = async (id: string, userId?: string) => {
  const fantaResult = await db.query.fanta.findFirst({
    ...fantaQueryConfig,
    where: (f, { eq }) => eq(f.id, id),
  })

  if (!fantaResult) {
    return null
  }

  const tastedIds = await tastedIdsForUser(userId, [fantaResult.id])

  return formatFanta(fantaResult, tastedIds.includes(fantaResult.id))
}

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

export const isFlavourExisting = async (flavour: string) => {
  const existing = await db.query.fanta.findFirst({
    where: (f, { eq }) => eq(f.flavour, flavour),
  })

  return Boolean(existing)
}
