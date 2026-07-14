import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { isFlavourExisting } from "../../src/lib/fanta/is-flavour-existing"
import { useTestDb } from "../helpers/db"
import { insertFanta } from "../helpers/factories"

describe("isFlavourExisting", () => {
  useTestDb()

  it("returns true when a fanta with that flavour exists", async () => {
    const flavour = faker.commerce.productName()
    await insertFanta({ flavour })

    expect(await isFlavourExisting(flavour)).toBe(true)
  })

  it("returns false for an unknown flavour", async () => {
    await insertFanta({ flavour: "Orange" })

    expect(await isFlavourExisting("Definitely Not A Flavour")).toBe(false)
  })

  it("matches exactly (case-sensitive)", async () => {
    await insertFanta({ flavour: "Orange" })

    expect(await isFlavourExisting("orange")).toBe(false)
  })
})
