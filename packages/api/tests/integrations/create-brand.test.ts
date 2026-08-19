import { faker } from "@faker-js/faker"
import { describe, expect, it } from "vitest"
import { createBrand } from "../../src/lib/brands/create-brand"
import { slugify } from "../../src/lib/slugify/slugify"
import { getImageUrl } from "../../src/storage"
import { db, useTestDb } from "../helpers/db"

describe("createBrand", () => {
  useTestDb()

  it("inserts and returns the created brand", async () => {
    const name = `${faker.company.name()} ${faker.string.alpha(8)}`
    const values = {
      name,
      slug: slugify(name),
      logoKey: `brands/${faker.string.alpha(10)}.png`,
    }

    const created = await createBrand(values)

    expect(created).toMatchObject({
      name: values.name,
      logoUrl: getImageUrl(values.logoKey),
    })
    expect(created.id).toEqual(expect.any(String))
  })

  it("persists the row", async () => {
    const name = `${faker.company.name()} ${faker.string.alpha(8)}`
    const values = {
      name,
      slug: slugify(name),
      logoKey: `brands/${faker.string.alpha(10)}.png`,
    }

    const created = await createBrand(values)

    const found = await db.query.brands.findFirst({
      where: (b, { eq }) => eq(b.id, created.id),
    })

    expect(found).toMatchObject(values)
  })

  it("rejects a duplicate brand name (unique constraint)", async () => {
    const name = `${faker.company.name()} ${faker.string.alpha(8)}`
    const slug = slugify(name)

    await createBrand({ name, slug, logoKey: "brands/a.png" })

    await expect(
      createBrand({ name, slug, logoKey: "brands/b.png" }),
    ).rejects.toThrow()
  })
})
