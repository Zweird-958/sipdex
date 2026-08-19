import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { drinkExists } from "../../src/lib/tastings/drink-exists"
import { useTestDb } from "../helpers/db"
import { insertDrink } from "../helpers/factories"

describe("drinkExists", () => {
  useTestDb()

  it("returns true for an existing drink", async () => {
    const drink = await insertDrink()

    expect(await drinkExists(drink.id)).toBe(true)
  })

  it("returns false for an unknown id", async () => {
    await insertDrink()

    expect(await drinkExists(faker.string.uuid())).toBe(false)
  })
})
