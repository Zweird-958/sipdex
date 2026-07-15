import { describe, expect, it } from "vitest"
import { addTasting } from "../../src/lib/tastings/add-tasting"
import { removeTasting } from "../../src/lib/tastings/remove-tasting"
import { tastedIdsForUser } from "../../src/lib/tastings/tasted-ids-for-user"
import { useTestDb } from "../helpers/db"
import { insertFanta, insertUser } from "../helpers/factories"

describe("removeTasting", () => {
  useTestDb()

  it("removes an existing tasting", async () => {
    const user = await insertUser()
    const fanta = await insertFanta()
    await addTasting(user.id, fanta.id)

    await removeTasting(user.id, fanta.id)

    expect(await tastedIdsForUser(user.id, [fanta.id])).toEqual([])
  })

  it("only removes the targeted user's tasting", async () => {
    const user = await insertUser()
    const other = await insertUser()
    const fanta = await insertFanta()
    await addTasting(user.id, fanta.id)
    await addTasting(other.id, fanta.id)

    await removeTasting(user.id, fanta.id)

    expect(await tastedIdsForUser(user.id, [fanta.id])).toEqual([])
    expect(await tastedIdsForUser(other.id, [fanta.id])).toEqual([fanta.id])
  })

  it("is a no-op when there is nothing to remove", async () => {
    const user = await insertUser()
    const fanta = await insertFanta()

    await expect(removeTasting(user.id, fanta.id)).resolves.not.toThrow()
  })
})
