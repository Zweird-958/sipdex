import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { tastings } from "../db/schema"

export const fantaExists = async (id: string) => {
  const fantaResult = await db.query.fanta.findFirst({
    where: (f, operators) => operators.eq(f.id, id),
  })

  return Boolean(fantaResult)
}

export const addTasting = async (userId: string, fantaId: string) => {
  await db.insert(tastings).values({ userId, fantaId }).onConflictDoNothing()
}

export const removeTasting = async (userId: string, fantaId: string) => {
  await db
    .delete(tastings)
    .where(and(eq(tastings.userId, userId), eq(tastings.fantaId, fantaId)))
}

export const tastedIdsForUser = async (
  userId: string | undefined,
  fantaIds: string[],
) => {
  if (!userId || fantaIds.length === 0) {
    return []
  }

  const result = await db.query.tastings.findMany({
    columns: { fantaId: true },
    where: (t, operators) =>
      operators.and(
        operators.eq(t.userId, userId),
        operators.inArray(t.fantaId, fantaIds),
      ),
  })

  return result.map(({ fantaId }) => fantaId)
}
