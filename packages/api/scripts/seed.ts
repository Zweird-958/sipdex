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
import { resolveCountry } from "../src/lib/countries/resolve-country"
import { logger } from "../src/lib/logger/logger"
import { slugify } from "../src/lib/slugify/slugify"
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
  { flavour: "Orange", countryCodes: ["FR", "DE"], image: "orange.png" },
  { flavour: "Lemon", countryCodes: ["IT"], image: "lemon.png" },
  { flavour: "Grape", countryCodes: ["ES", "US"], image: "grape.png" },
  { flavour: "Strawberry", countryCodes: ["JP"], image: "strawberry.png" },
  { flavour: "Exotic", countryCodes: ["BR", "FR"], image: "exotic.png" },
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

const uploadFantaImage = async (flavour: string, fileName: string) => {
  const buffer = await readFile(
    new URL(`./fanta-images/${fileName}`, import.meta.url),
  )
  const image = new File([buffer], fileName, { type: "image/png" })

  return uploadImage({ image, folder: "fanta", name: slugify(flavour) })
}

const seedFanta = async (countryIdByCode: Map<string, string>) => {
  const imageKeys = await Promise.all(
    FANTA_SEED.map(({ flavour, image }) => uploadFantaImage(flavour, image)),
  )

  const createdFanta = await db
    .insert(fantaTable)
    .values(
      FANTA_SEED.map(({ flavour }, index) => ({
        flavour,
        imageKey: imageKeys[index],
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
      await auth.api.signUpEmail({
        body: { name, email, password },
      })

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!user) {
        throw new Error(`User not found after sign-up: ${email}`)
      }

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
  logger.info("🧹 Clearing existing data...")
  await clearData()

  logger.info("🌍 Seeding 7 countries...")
  const countryIdByCode = await seedCountries()

  logger.info("👤 Seeding 2 users (1 admin, 1 default)...")
  const userIds = await seedUsers()

  logger.info("🥤 Seeding 5 Fanta (uploading real images)...")
  const fantaIds = await seedFanta(countryIdByCode)

  logger.info("😋 Seeding 3 tastings per user...")
  await seedTastings(userIds, fantaIds)

  logger.info("✅ Seed complete")
  logger.info("   Admin: admin@fantadex.io / Password123!")
  logger.info("   User:  user@fantadex.io / Password123!")

  await pool.end()
}

main().catch((err: unknown) => {
  logger.error({ err }, "Seed failed")
  process.exit(1)
})
