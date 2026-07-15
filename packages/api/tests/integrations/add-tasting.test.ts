import { and, eq } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import { tastings } from "../../src/db/schema"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { db, useTestDb } from "../helpers/db"
import { insertFanta, insertUser } from "../helpers/factories"

const countTastings = async (userId: string, fantaId: string) => {
  const rows = await db
    .select()
    .from(tastings)
    .where(and(eq(tastings.userId, userId), eq(tastings.fantaId, fantaId)))

  return rows.length
}

describe("addTasting", () => {
  useTestDb()

  it("records a tasting for the user", async () => {
    const user = await insertUser()
    const fanta = await insertFanta()

    await addTasting(user.id, fanta.id)

    expect(await countTastings(user.id, fanta.id)).toBe(1)
  })

  it("is idempotent when tasting the same fanta twice", async () => {
    const user = await insertUser()
    const fanta = await insertFanta()

    await addTasting(user.id, fanta.id)
    await expect(addTasting(user.id, fanta.id)).resolves.not.toThrow()

    expect(await countTastings(user.id, fanta.id)).toBe(1)
  })
})
