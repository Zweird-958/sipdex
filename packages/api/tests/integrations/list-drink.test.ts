import { describe, expect, it } from "vitest"
import { listDrinks } from "../../src/lib/drinks/list-drinks"
import { useTestDb } from "../helpers/db"
import { insertDrink, insertTasting, insertUser } from "../helpers/factories"

describe("listDrinks", () => {
  useTestDb()

  it("returns an empty array when there is no drink", async () => {
    expect(await listDrinks()).toEqual([])
  })

  it("returns every drink ordered by id", async () => {
    const drinks = await Promise.all(
      Array.from({ length: 3 }, () => insertDrink()),
    )

    const result = await listDrinks()

    const expectedIds = drinks.map((d) => d.id).sort()
    expect(result.map((d) => d.id)).toEqual(expectedIds)
    expect(result.every((d) => d.tasted === null)).toBe(true)
  })

  it("flags only the drink the given user has tasted", async () => {
    const tasted = await insertDrink()
    const untasted = await insertDrink()
    const user = await insertUser()
    await insertTasting(user.id, tasted.id)

    const result = await listDrinks(user.id)
    const byId = new Map(result.map((d) => [d.id, d.tasted]))

    expect(byId.get(tasted.id)).toBe(true)
    expect(byId.get(untasted.id)).toBe(false)
  })
})
