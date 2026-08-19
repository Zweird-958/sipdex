import { faker } from "@faker-js/faker"
import { db } from "../../src/db"
import {
  brands,
  countries,
  drinkCountries,
  drinks,
  tastings,
  users,
} from "../../src/db/schema"
import { slugify } from "../../src/lib/slugify/slugify"
import type { Role } from "../../src/types/user"

// Direct-insert factories used to arrange DB state. They deliberately bypass the
// lib functions under test so a test only exercises its own subject.

export const insertUser = async (
  overrides: { name?: string; email?: string; role?: Role } = {},
) => {
  const [row] = await db
    .insert(users)
    .values({
      name: overrides.name ?? faker.person.fullName(),
      email: overrides.email ?? `${faker.string.uuid()}@example.com`,
      role: overrides.role ?? "user",
    })
    .returning()

  return row
}

export const insertCountry = async (
  overrides: { name?: string; code?: string } = {},
) => {
  const [row] = await db
    .insert(countries)
    .values({
      name:
        overrides.name ??
        `${faker.location.country()} ${faker.string.alpha(8)}`,
      code: overrides.code ?? faker.location.countryCode("alpha-2"),
    })
    .returning()

  return row
}

export const insertBrand = async (
  overrides: { name?: string; slug?: string; logoKey?: string } = {},
) => {
  const name =
    overrides.name ?? `${faker.company.name()} ${faker.string.alpha(8)}`

  const [row] = await db
    .insert(brands)
    .values({
      name,
      slug: overrides.slug ?? slugify(name),
      logoKey: overrides.logoKey ?? `brands/${faker.string.alpha(10)}.png`,
    })
    .returning()

  return row
}

export const insertDrink = async (
  overrides: {
    flavour?: string
    slug?: string
    imageKey?: string
    brandId?: string
    countryIds?: string[]
  } = {},
) => {
  const brandId = overrides.brandId ?? (await insertBrand()).id
  const flavour =
    overrides.flavour ??
    `${faker.commerce.productName()} ${faker.string.alpha(6)}`

  const [row] = await db
    .insert(drinks)
    .values({
      flavour,
      slug: overrides.slug ?? slugify(flavour),
      imageKey: overrides.imageKey ?? `drinks/${faker.string.alpha(10)}.png`,
      brandId,
    })
    .returning()

  const countryIds = overrides.countryIds ?? []

  if (countryIds.length > 0) {
    await db
      .insert(drinkCountries)
      .values(countryIds.map((countryId) => ({ drinkId: row.id, countryId })))
  }

  return row
}

export const insertTasting = async (userId: string, drinkId: string) => {
  const [row] = await db
    .insert(tastings)
    .values({ userId, drinkId })
    .returning()

  return row
}
