import { faker } from "@faker-js/faker"
import "dotenv/config"
import { eq } from "drizzle-orm"
import { auth } from "../src/auth"
import { db, pool } from "../src/db"
import {
  brands as brandsTable,
  countries as countriesTable,
  drinkCountries,
  drinks as drinksTable,
  tastings,
  users,
} from "../src/db/schema"
import { resolveCountry } from "../src/lib/countries/resolve-country"
import { logger } from "../src/lib/logger/logger"
import { slugify } from "../src/lib/slugify/slugify"
import { uploadImage } from "../src/storage"
import { BRAND_SEED, COUNTRY_INPUTS, DRINK_SEED, USER_SEED } from "./seed-data"

const clearData = async () => {
  await db.delete(tastings)
  await db.delete(drinkCountries)
  await db.delete(drinksTable)
  await db.delete(brandsTable)
  await db.delete(countriesTable)
  await db.delete(users)
}

// Fetch a random faker image and return it as a File ready for S3 upload.
const fetchSeedImage = async () => {
  const response = await fetch(faker.image.url({ width: 512, height: 512 }))

  if (!response.ok) {
    throw new Error(`Failed to fetch seed image: ${response.status}`)
  }

  const type = response.headers.get("content-type") ?? "image/jpeg"

  return new File([Buffer.from(await response.arrayBuffer())], "seed", { type })
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

type SeededBrand = { id: string; slug: string }

const seedBrands = async () => {
  const values = await Promise.all(
    BRAND_SEED.map(async ({ name }) => {
      const slug = slugify(name)
      const image = await fetchSeedImage()
      const logoKey = await uploadImage({ image, folder: "brands", name: slug })

      return { name, slug, logoKey }
    }),
  )

  const rows = await db.insert(brandsTable).values(values).returning({
    id: brandsTable.id,
    name: brandsTable.name,
    slug: brandsTable.slug,
  })

  return new Map<string, SeededBrand>(
    rows.map((row) => [row.name, { id: row.id, slug: row.slug }]),
  )
}

const seedDrinks = async (
  countryIdByCode: Map<string, string>,
  brandByName: Map<string, SeededBrand>,
) => {
  const values = await Promise.all(
    DRINK_SEED.map(async ({ flavour, brand }) => {
      const seededBrand = brandByName.get(brand)

      if (!seededBrand) {
        throw new Error(`Missing seeded brand "${brand}"`)
      }

      const slug = slugify(flavour)
      const image = await fetchSeedImage()
      const imageKey = await uploadImage({
        image,
        folder: seededBrand.slug,
        name: slug,
      })

      return { flavour, slug, brandId: seededBrand.id, imageKey }
    }),
  )

  const createdDrinks = await db
    .insert(drinksTable)
    .values(values)
    .returning({ id: drinksTable.id })

  const links = DRINK_SEED.flatMap(({ countryCodes }, index) =>
    countryCodes.map((code) => {
      const countryId = countryIdByCode.get(code)

      if (!countryId) {
        throw new Error(`Missing seeded country for code "${code}"`)
      }

      return { drinkId: createdDrinks[index].id, countryId }
    }),
  )

  await db.insert(drinkCountries).values(links)

  return createdDrinks.map((d) => d.id)
}

const seedUsers = () =>
  Promise.all(
    USER_SEED.map(async ({ name, email, password, role }) => {
      await auth.api.signUpEmail({ body: { name, email, password } })

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

const seedTastings = async (userIds: string[], drinkIds: string[]) => {
  // 3 tastings per user, offset so the two users overlap on one flavour.
  const values = userIds.flatMap((userId, userIndex) =>
    [0, 1, 2].map((offset) => ({
      userId,
      drinkId: drinkIds[(userIndex * 2 + offset) % drinkIds.length],
    })),
  )

  await db.insert(tastings).values(values)
}

const main = async () => {
  logger.info("🧹 Clearing existing data...")
  await clearData()

  logger.info("🌍 Seeding countries...")
  const countryIdByCode = await seedCountries()

  logger.info("🏷️  Seeding brands (uploading real logos)...")
  const brandByName = await seedBrands()

  logger.info("👤 Seeding users (1 admin, 1 default)...")
  const userIds = await seedUsers()

  logger.info("🥤 Seeding drinks (uploading real images)...")
  const drinkIds = await seedDrinks(countryIdByCode, brandByName)

  logger.info("😋 Seeding tastings...")
  await seedTastings(userIds, drinkIds)

  logger.info("✅ Seed complete")
  logger.info("   Admin: admin@sipdex.io / Password123!")
  logger.info("   User:  user@sipdex.io / Password123!")

  await pool.end()
}

main().catch((err: unknown) => {
  logger.error({ err }, "Seed failed")
  process.exit(1)
})
