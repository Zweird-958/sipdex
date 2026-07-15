import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { createCountry } from "../../src/lib/countries/create-country"
import { db, useTestDb } from "../helpers/db"

describe("createCountry", () => {
  useTestDb()

  it("inserts and returns the created country", async () => {
    const values = {
      name: faker.location.country(),
      code: faker.location.countryCode("alpha-2"),
    }

    const created = await createCountry(values)

    expect(created).toMatchObject(values)
    expect(created.id).toEqual(expect.any(String))
    expect(created.createdAt).toBeInstanceOf(Date)
  })

  it("persists the row", async () => {
    const values = {
      name: faker.location.country(),
      code: faker.location.countryCode("alpha-2"),
    }

    const created = await createCountry(values)

    const found = await db.query.countries.findFirst({
      where: (c, { eq }) => eq(c.id, created.id),
    })

    expect(found).toMatchObject(values)
  })

  it("rejects a duplicate country name (unique constraint)", async () => {
    const name = faker.location.country()

    await createCountry({ name, code: "AA" })

    await expect(createCountry({ name, code: "BB" })).rejects.toThrow()
  })
})
