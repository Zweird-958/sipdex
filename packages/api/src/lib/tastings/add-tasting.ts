import { db } from "../../db"
import { tastings } from "../../db/schema"

export const addTasting = async (userId: string, drinkId: string) => {
  await db.insert(tastings).values({ userId, drinkId }).onConflictDoNothing()
}
