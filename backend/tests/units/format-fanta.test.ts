import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { formatFanta } from "../../src/lib/fanta/format-fanta"
import { getImageUrl } from "../../src/storage"
import type { FantaWithCountries } from "../../src/types/fanta"

const buildFanta = (
  overrides: Partial<FantaWithCountries> = {},
): FantaWithCountries => ({
  id: faker.string.uuid(),
  flavour: faker.commerce.productName(),
  imageKey: `fanta/${faker.string.alpha(10)}.png`,
  createdAt: faker.date.past(),
  fantaCountries: [],
  ...overrides,
})

describe("formatFanta", () => {
  it("maps the entity onto the public shape", () => {
    const fanta = buildFanta()

    const result = formatFanta(fanta, false)

    expect(result).toEqual({
      id: fanta.id,
      flavour: fanta.flavour,
      imageUrl: getImageUrl(fanta.imageKey),
      countries: [],
      tasted: false,
      createdAt: fanta.createdAt,
    })
  })

  it("builds the image URL from the storage helper", () => {
    const fanta = buildFanta()

    const { imageUrl } = formatFanta(fanta, false)

    expect(imageUrl).toBe(getImageUrl(fanta.imageKey))
    expect(imageUrl.endsWith(fanta.imageKey)).toBe(true)
  })

  it("flattens and alphabetically sorts the countries", () => {
    const fanta = buildFanta({
      fantaCountries: [
        { country: { name: "Zimbabwe", code: "ZW" } },
        { country: { name: "Albania", code: "AL" } },
        { country: { name: "Mexico", code: "MX" } },
      ],
    })

    const { countries } = formatFanta(fanta, false)

    expect(countries).toEqual([
      { name: "Albania", code: "AL" },
      { name: "Mexico", code: "MX" },
      { name: "Zimbabwe", code: "ZW" },
    ])
  })

  it("passes the tasted flag through unchanged", () => {
    const fanta = buildFanta()

    expect(formatFanta(fanta, true).tasted).toBe(true)
    expect(formatFanta(fanta, false).tasted).toBe(false)
  })
})
