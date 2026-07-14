import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { fantaExists } from "../../src/lib/tastings/fanta-exists"
import { useTestDb } from "../helpers/db"
import { insertFanta } from "../helpers/factories"

describe("fantaExists", () => {
  useTestDb()

  it("returns true for an existing fanta", async () => {
    const fanta = await insertFanta()

    expect(await fantaExists(fanta.id)).toBe(true)
  })

  it("returns false for an unknown id", async () => {
    await insertFanta()

    expect(await fantaExists(faker.string.uuid())).toBe(false)
  })
})
