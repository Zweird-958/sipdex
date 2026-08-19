import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { tastedIdsForUser } from "../../src/lib/tastings/tasted-ids-for-user"
import { useTestDb } from "../helpers/db"
import { insertDrink, insertTasting, insertUser } from "../helpers/factories"

describe("tastedIdsForUser", () => {
  useTestDb()

  it("returns the tasted ids within the requested set", async () => {
    const user = await insertUser()
    const tastedA = await insertDrink()
    const tastedB = await insertDrink()
    const untasted = await insertDrink()
    await insertTasting(user.id, tastedA.id)
    await insertTasting(user.id, tastedB.id)

    const result = await tastedIdsForUser(user.id, [
      tastedA.id,
      tastedB.id,
      untasted.id,
    ])

    expect(result.sort()).toEqual([tastedA.id, tastedB.id].sort())
  })

  it("excludes tasted drink that are not in the requested set", async () => {
    const user = await insertUser()
    const inSet = await insertDrink()
    const outOfSet = await insertDrink()
    await insertTasting(user.id, inSet.id)
    await insertTasting(user.id, outOfSet.id)

    expect(await tastedIdsForUser(user.id, [inSet.id])).toEqual([inSet.id])
  })

  it("returns an empty array when userId is undefined", async () => {
    const drink = await insertDrink()

    // eslint-disable-next-line no-undefined -- exercising the anonymous branch
    expect(await tastedIdsForUser(undefined, [drink.id])).toEqual([])
  })

  it("returns an empty array when no drink ids are requested", async () => {
    const user = await insertUser()

    expect(await tastedIdsForUser(user.id, [])).toEqual([])
  })

  it("returns an empty array when the user has tasted nothing", async () => {
    const user = await insertUser()
    const drink = await insertDrink()

    expect(await tastedIdsForUser(user.id, [drink.id])).toEqual([])

    expect(await tastedIdsForUser(user.id, [faker.string.uuid()])).toEqual([])
  })
})
