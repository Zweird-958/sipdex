import { describe, expect, it } from "vitest"
import { brandExists } from "../../src/lib/brands/brand-exists"
import { slugify } from "../../src/lib/slugify/slugify"
import { useTestDb } from "../helpers/db"
import { insertBrand } from "../helpers/factories"

describe("brandExists", () => {
  useTestDb()

  it("returns true when a brand with that slug exists", async () => {
    await insertBrand({ name: "Coca-Cola" })

    expect(await brandExists(slugify("Coca-Cola"))).toBe(true)
  })

  it("returns false for an unknown slug", async () => {
    await insertBrand({ name: "Coca-Cola" })

    expect(await brandExists(slugify("Pepsi"))).toBe(false)
  })
})
