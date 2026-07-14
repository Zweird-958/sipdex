/* eslint-disable no-console */
import "dotenv/config"
import { eq } from "drizzle-orm"
import { readFile } from "node:fs/promises"
import { auth } from "../src/auth"
import { db, pool } from "../src/db"
import {
  countries as countriesTable,
  fantaCountries,
  fanta as fantaTable,
  tastings,
  users,
} from "../src/db/schema"
import { resolveCountry } from "../src/lib/countries"
import { uploadImage } from "../src/storage"

const COUNTRY_INPUTS = [
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Japan",
  "United States",
  "Brazil",
]

const FANTA_SEED = [
  { flavour: "Orange", countryCodes: ["FR", "DE"] },
  { flavour: "Lemon", countryCodes: ["IT"] },
  { flavour: "Grape", countryCodes: ["ES", "US"] },
  { flavour: "Strawberry", countryCodes: ["JP"] },
  { flavour: "Exotic", countryCodes: ["BR", "FR"] },
]

const USER_SEED = [
  {
    name: "Admin",
    email: "admin@fantadex.io",
    password: "Password123!",
    role: "admin" as const,
  },
  {
    name: "User",
    email: "user@fantadex.io",
    password: "Password123!",
    role: "user" as const,
  },
]

const clearData = async () => {
  await db.delete(tastings)
  await db.delete(fantaCountries)
  await db.delete(fantaTable)
  await db.delete(countriesTable)
  await db.delete(users)
}

const seedCountries = async () => {
  const values = COUNTRY_INPUTS.map((input) => {
    const resolved = resolveCountry(input)

    if (!resolved) {
      throw new Error(`Could not resolve country "${input}"`)
    }

    return resolved
  })

  const rows = await db.insert(countriesTable).values(values).returning({
    id: countriesTable.id,
    code: countriesTable.code,
  })

  return new Map(rows.map((row) => [row.code, row.id]))
}

const uploadSeedImage = async () => {
  const buffer = await readFile(new URL("../bruno/sample.png", import.meta.url))
  const image = new File([buffer], "sample.png", { type: "image/png" })

  return uploadImage({ image, folder: "fanta", name: "seed.png" })
}

const seedFanta = async (
  countryIdByCode: Map<string, string>,
  imageKey: string,
) => {
  const createdFanta = await db
    .insert(fantaTable)
    .values(
      FANTA_SEED.map(({ flavour }) => ({
        flavour,
        imageKey,
      })),
    )
    .returning({ id: fantaTable.id })

  const links = FANTA_SEED.flatMap(({ countryCodes }, index) =>
    countryCodes.map((code) => {
      const countryId = countryIdByCode.get(code)

      if (!countryId) {
        throw new Error(`Missing seeded country for code "${code}"`)
      }

      return { fantaId: createdFanta[index].id, countryId }
    }),
  )

  await db.insert(fantaCountries).values(links)

  return createdFanta.map((f) => f.id)
}

const seedUsers = () =>
  Promise.all(
    USER_SEED.map(async ({ name, email, password, role }) => {
      const { user } = await auth.api.signUpEmail({
        body: { name, email, password },
      })

      if (role === "admin") {
        await db.update(users).set({ role }).where(eq(users.id, user.id))
      }

      return user.id
    }),
  )

const seedTastings = async (userIds: string[], fantaIds: string[]) => {
  // 3 tastings per user, offset so the two users overlap on one flavour.
  const values = userIds.flatMap((userId, userIndex) =>
    [0, 1, 2].map((offset) => ({
      userId,
      fantaId: fantaIds[(userIndex * 2 + offset) % fantaIds.length],
    })),
  )

  await db.insert(tastings).values(values)
}

const main = async () => {
  console.log("🧹 Clearing existing data...")
  await clearData()

  console.log("🪣 Ensuring bucket + uploading shared Fanta image...")
  const imageKey = await uploadSeedImage()

  console.log("🌍 Seeding 7 countries...")
  const countryIdByCode = await seedCountries()

  console.log("👤 Seeding 2 users (1 admin, 1 default)...")
  const userIds = await seedUsers()

  console.log("🥤 Seeding 5 Fanta...")
  const fantaIds = await seedFanta(countryIdByCode, imageKey)

  console.log("😋 Seeding 3 tastings per user...")
  await seedTastings(userIds, fantaIds)

  console.log("✅ Seed complete")
  console.log("   Admin: admin@fantadex.io / Password123!")
  console.log("   User:  user@fantadex.io / Password123!")

  await pool.end()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
