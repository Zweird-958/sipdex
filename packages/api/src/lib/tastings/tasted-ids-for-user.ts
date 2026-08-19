import { db } from "../../db"

export const tastedIdsForUser = async (
  userId: string | undefined,
  drinkIds: string[],
) => {
  if (!userId || drinkIds.length === 0) {
    return []
  }

  const result = await db.query.tastings.findMany({
    columns: { drinkId: true },
    where: (t, operators) =>
      operators.and(
        operators.eq(t.userId, userId),
        operators.inArray(t.drinkId, drinkIds),
      ),
  })

  return result.map(({ drinkId }) => drinkId)
}
