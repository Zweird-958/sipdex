import { describe, expect, it } from "vitest"
import { isDrinkExisting } from "../../src/lib/drinks/is-drink-existing"
import { slugify } from "../../src/lib/slugify/slugify"
import { useTestDb } from "../helpers/db"
import { insertBrand, insertDrink } from "../helpers/factories"

describe("isDrinkExisting", () => {
  useTestDb()

  it("returns true when the brand already has that flavour", async () => {
    const brand = await insertBrand()
    await insertDrink({ flavour: "Orange", brandId: brand.id })

    expect(await isDrinkExisting(brand.id, slugify("Orange"))).toBe(true)
  })

  it("matches case-insensitively via the slug", async () => {
    const brand = await insertBrand()
    await insertDrink({ flavour: "Orange", brandId: brand.id })

    expect(await isDrinkExisting(brand.id, slugify("orange"))).toBe(true)
  })

  it("returns false when another brand has the flavour", async () => {
    const brandA = await insertBrand()
    const brandB = await insertBrand()
    await insertDrink({ flavour: "Orange", brandId: brandA.id })

    expect(await isDrinkExisting(brandB.id, slugify("Orange"))).toBe(false)
  })

  it("returns false for an unknown flavour", async () => {
    const brand = await insertBrand()
    await insertDrink({ flavour: "Orange", brandId: brand.id })

    expect(await isDrinkExisting(brand.id, slugify("Lemon"))).toBe(false)
  })
})
