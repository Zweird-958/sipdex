import { faker } from "@faker-js/faker"
import { db } from "../../src/db"
import {
  countries,
  fanta,
  fantaCountries,
  tastings,
  users,
} from "../../src/db/schema"
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

export const insertFanta = async (
  overrides: {
    flavour?: string
    imageKey?: string
    countryIds?: string[]
  } = {},
) => {
  const [row] = await db
    .insert(fanta)
    .values({
      flavour:
        overrides.flavour ??
        `${faker.commerce.productName()} ${faker.string.alpha(6)}`,
      imageKey: overrides.imageKey ?? `fanta/${faker.string.alpha(10)}.png`,
    })
    .returning()

  const countryIds = overrides.countryIds ?? []

  if (countryIds.length > 0) {
    await db
      .insert(fantaCountries)
      .values(countryIds.map((countryId) => ({ fantaId: row.id, countryId })))
  }

  return row
}

export const insertTasting = async (userId: string, fantaId: string) => {
  const [row] = await db
    .insert(tastings)
    .values({ userId, fantaId })
    .returning()

  return row
}
