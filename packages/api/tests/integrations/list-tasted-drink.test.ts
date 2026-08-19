import { describe, expect, it } from "vitest"
import { listTastedDrinks } from "../../src/lib/drinks/list-tasted-drink"
import { useTestDb } from "../helpers/db"
import { insertDrink, insertTasting, insertUser } from "../helpers/factories"

describe("listTastedDrinks", () => {
  useTestDb()

  it("returns only the drink the user has tasted, all flagged tasted", async () => {
    const user = await insertUser()
    const first = await insertDrink()
    const second = await insertDrink()

    await insertDrink()
    await insertTasting(user.id, first.id)
    await insertTasting(user.id, second.id)

    const result = await listTastedDrinks(user.id)

    expect(result.map((d) => d.id).sort()).toEqual([first.id, second.id].sort())
    expect(result.every((d) => d.tasted === true)).toBe(true)
  })

  it("does not return drink tasted by other users", async () => {
    const user = await insertUser()
    const other = await insertUser()
    const drink = await insertDrink()
    await insertTasting(other.id, drink.id)

    expect(await listTastedDrinks(user.id)).toEqual([])
  })

  it("returns an empty array when the user has tasted nothing", async () => {
    const user = await insertUser()

    expect(await listTastedDrinks(user.id)).toEqual([])
  })
})
