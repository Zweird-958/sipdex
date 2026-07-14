import { db } from "../../db"
import { tastings } from "../../db/schema"

export const addTasting = async (userId: string, fantaId: string) => {
  await db.insert(tastings).values({ userId, fantaId }).onConflictDoNothing()
}
