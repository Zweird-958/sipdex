import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { slugify } from "../../src/lib/slugify/slugify"

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Orange Mango")).toBe("orange-mango")
  })

  it("strips special characters", () => {
    expect(slugify("Piña Colada! (2024)")).toBe("pina-colada-2024")
  })

  it("collapses surrounding whitespace", () => {
    expect(slugify("  Cherry   Cola  ")).toBe("cherry-cola")
  })

  it("only ever emits lowercase, digits and hyphens", () => {
    for (let i = 0; i < 25; i += 1) {
      const words = faker.lorem.words({ min: 1, max: 4 })

      expect(slugify(words)).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
    }
  })
})
