import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { createFanta } from "../../src/lib/fanta/create-fanta"
import { db, useTestDb } from "../helpers/db"
import { insertCountry } from "../helpers/factories"

describe("createFanta", () => {
  useTestDb()

  it("creates the fanta and links the given countries", async () => {
    const fr = await insertCountry()
    const de = await insertCountry()

    const flavour = faker.commerce.productName()
    const imageKey = `fanta/${faker.string.alpha(8)}.png`

    const { id } = await createFanta({
      flavour,
      imageKey,
      countryIds: [fr.id, de.id],
    })

    const created = await db.query.fanta.findFirst({
      with: { fantaCountries: true },
      where: (f, { eq }) => eq(f.id, id),
    })

    expect(created).toMatchObject({ flavour, imageKey })
    expect(created?.fantaCountries.map((fc) => fc.countryId).sort()).toEqual(
      [fr.id, de.id].sort(),
    )
  })

  it("rolls back the fanta when a country link is invalid", async () => {
    const flavour = faker.commerce.productName()

    await expect(
      createFanta({
        flavour,
        imageKey: "fanta/x.png",
        // Non-existent country id violates the fanta_countries FK.
        countryIds: [faker.string.uuid()],
      }),
    ).rejects.toThrow()

    const found = await db.query.fanta.findFirst({
      where: (f, { eq }) => eq(f.flavour, flavour),
    })

    expect(found).toBeUndefined()
  })
})
