import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { getDrink } from "../../src/lib/drinks/get-drink"
import { getImageUrl } from "../../src/storage"
import { useTestDb } from "../helpers/db"
import {
  insertBrand,
  insertCountry,
  insertDrink,
  insertTasting,
  insertUser,
} from "../helpers/factories"

describe("getDrink", () => {
  useTestDb()

  it("returns the formatted drink with brand and sorted countries", async () => {
    const brand = await insertBrand()
    const zw = await insertCountry({ name: "Zimbabwe", code: "ZW" })
    const al = await insertCountry({ name: "Albania", code: "AL" })
    const drink = await insertDrink({
      brandId: brand.id,
      countryIds: [zw.id, al.id],
    })

    const result = await getDrink(drink.id)

    expect(result).toEqual({
      id: drink.id,
      flavour: drink.flavour,
      imageUrl: getImageUrl(drink.imageKey),
      brand: {
        id: brand.id,
        name: brand.name,
        logoUrl: getImageUrl(brand.logoKey),
      },
      countries: [
        { name: "Albania", code: "AL" },
        { name: "Zimbabwe", code: "ZW" },
      ],
      tasted: null,
      createdAt: drink.createdAt,
    })
  })

  it("marks the drink as tasted for a user who tasted it", async () => {
    const drink = await insertDrink()
    const user = await insertUser()
    await insertTasting(user.id, drink.id)

    expect((await getDrink(drink.id, user.id))?.tasted).toBe(true)
  })

  it("is not tasted for a user who has not tasted it", async () => {
    const drink = await insertDrink()
    const user = await insertUser()

    expect((await getDrink(drink.id, user.id))?.tasted).toBe(false)
  })

  it("returns null for an unknown id", async () => {
    expect(await getDrink(faker.string.uuid())).toBeNull()
  })
})
