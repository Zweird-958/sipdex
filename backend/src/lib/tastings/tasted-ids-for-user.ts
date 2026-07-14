import { db } from "../../db"

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
