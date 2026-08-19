import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { formatDrink } from "../../src/lib/drinks/format-drink"
import { getImageUrl } from "../../src/storage"
import type { DrinkWithRelations } from "../../src/types/drinks"

const buildDrink = (
  overrides: Partial<DrinkWithRelations> = {},
): DrinkWithRelations => ({
  id: faker.string.uuid(),
  flavour: faker.commerce.productName(),
  imageKey: `drinks/${faker.string.alpha(10)}.png`,
  createdAt: faker.date.past(),
  brand: {
    id: faker.string.uuid(),
    name: faker.company.name(),
    logoKey: `brands/${faker.string.alpha(10)}.png`,
  },
  drinkCountries: [],
  ...overrides,
})

describe("formatDrink", () => {
  it("maps the entity onto the public shape", () => {
    const drink = buildDrink()

    const result = formatDrink(drink, false)

    expect(result).toEqual({
      id: drink.id,
      flavour: drink.flavour,
      imageUrl: getImageUrl(drink.imageKey),
      brand: {
        id: drink.brand.id,
        name: drink.brand.name,
        logoUrl: getImageUrl(drink.brand.logoKey),
      },
      countries: [],
      tasted: false,
      createdAt: drink.createdAt,
    })
  })

  it("builds the image URL from the storage helper", () => {
    const drink = buildDrink()

    const { imageUrl } = formatDrink(drink, false)

    expect(imageUrl).toBe(getImageUrl(drink.imageKey))
    expect(imageUrl.endsWith(drink.imageKey)).toBe(true)
  })

  it("builds the brand logo URL from the storage helper", () => {
    const drink = buildDrink()

    const { brand } = formatDrink(drink, false)

    expect(brand.logoUrl).toBe(getImageUrl(drink.brand.logoKey))
    expect(brand.logoUrl.endsWith(drink.brand.logoKey)).toBe(true)
  })

  it("flattens and alphabetically sorts the countries", () => {
    const drink = buildDrink({
      drinkCountries: [
        { country: { name: "Zimbabwe", code: "ZW" } },
        { country: { name: "Albania", code: "AL" } },
        { country: { name: "Mexico", code: "MX" } },
      ],
    })

    const { countries } = formatDrink(drink, false)

    expect(countries).toEqual([
      { name: "Albania", code: "AL" },
      { name: "Mexico", code: "MX" },
      { name: "Zimbabwe", code: "ZW" },
    ])
  })

  it("passes the tasted flag through unchanged", () => {
    const drink = buildDrink()

    expect(formatDrink(drink, true).tasted).toBe(true)
    expect(formatDrink(drink, false).tasted).toBe(false)
    expect(formatDrink(drink, null).tasted).toBe(null)
  })
})
