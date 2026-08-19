import { describe, expect, it } from "vitest"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { removeTasting } from "../../src/lib/tastings/remove-tasting"
import { tastedIdsForUser } from "../../src/lib/tastings/tasted-ids-for-user"
import { useTestDb } from "../helpers/db"
import { insertDrink, insertUser } from "../helpers/factories"

describe("removeTasting", () => {
  useTestDb()

  it("removes an existing tasting", async () => {
    const user = await insertUser()
    const drink = await insertDrink()
    await addTasting(user.id, drink.id)

    await removeTasting(user.id, drink.id)

    expect(await tastedIdsForUser(user.id, [drink.id])).toEqual([])
  })

  it("only removes the targeted user's tasting", async () => {
    const user = await insertUser()
    const other = await insertUser()
    const drink = await insertDrink()
    await addTasting(user.id, drink.id)
    await addTasting(other.id, drink.id)

    await removeTasting(user.id, drink.id)

    expect(await tastedIdsForUser(user.id, [drink.id])).toEqual([])
    expect(await tastedIdsForUser(other.id, [drink.id])).toEqual([drink.id])
  })

  it("is a no-op when there is nothing to remove", async () => {
    const user = await insertUser()
    const drink = await insertDrink()

    await expect(removeTasting(user.id, drink.id)).resolves.not.toThrow()
  })
})
