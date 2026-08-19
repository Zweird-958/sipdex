import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { createDrink } from "../../src/lib/drinks/create-drink"
import { slugify } from "../../src/lib/slugify/slugify"
import { db, useTestDb } from "../helpers/db"
import { insertBrand, insertCountry } from "../helpers/factories"

describe("createDrink", () => {
  useTestDb()

  it("creates the drink and links the given countries", async () => {
    const brand = await insertBrand()
    const fr = await insertCountry()
    const de = await insertCountry()

    const flavour = faker.commerce.productName()
    const slug = slugify(flavour)
    const imageKey = `drinks/${faker.string.alpha(8)}.png`

    const { id } = await createDrink({
      flavour,
      slug,
      imageKey,
      brandId: brand.id,
      countryIds: [fr.id, de.id],
    })

    const created = await db.query.drinks.findFirst({
      with: { drinkCountries: true },
      where: (d, { eq }) => eq(d.id, id),
    })

    expect(created).toMatchObject({
      flavour,
      slug,
      imageKey,
      brandId: brand.id,
    })
    expect(created?.drinkCountries.map((dc) => dc.countryId).sort()).toEqual(
      [fr.id, de.id].sort(),
    )
  })

  it("rolls back the drink when a country link is invalid", async () => {
    const brand = await insertBrand()
    const flavour = faker.commerce.productName()

    await expect(
      createDrink({
        flavour,
        slug: slugify(flavour),
        imageKey: "drinks/x.png",
        brandId: brand.id,
        // Non-existent country id violates the drink_countries FK.
        countryIds: [faker.string.uuid()],
      }),
    ).rejects.toThrow()

    const found = await db.query.drinks.findFirst({
      where: (d, { eq }) => eq(d.flavour, flavour),
    })

    expect(found).toBeUndefined()
  })
})
