import { and, eq } from "drizzle-orm"
import { db } from "../../db"
import { tastings } from "../../db/schema"

export const removeTasting = async (userId: string, drinkId: string) => {
  await db
    .delete(tastings)
    .where(and(eq(tastings.userId, userId), eq(tastings.drinkId, drinkId)))
}
