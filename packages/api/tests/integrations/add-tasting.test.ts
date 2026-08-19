import { and, eq } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import { tastings } from "../../src/db/schema"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { db, useTestDb } from "../helpers/db"
import { insertDrink, insertUser } from "../helpers/factories"

const countTastings = async (userId: string, drinkId: string) => {
  const rows = await db
    .select()
    .from(tastings)
    .where(and(eq(tastings.userId, userId), eq(tastings.drinkId, drinkId)))

  return rows.length
}

describe("addTasting", () => {
  useTestDb()

  it("records a tasting for the user", async () => {
    const user = await insertUser()
    const drink = await insertDrink()

    await addTasting(user.id, drink.id)

    expect(await countTastings(user.id, drink.id)).toBe(1)
  })

  it("is idempotent when tasting the same drink twice", async () => {
    const user = await insertUser()
    const drink = await insertDrink()

    await addTasting(user.id, drink.id)
    await expect(addTasting(user.id, drink.id)).resolves.not.toThrow()

    expect(await countTastings(user.id, drink.id)).toBe(1)
  })
})
