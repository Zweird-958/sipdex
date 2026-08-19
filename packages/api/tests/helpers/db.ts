import { sql } from "drizzle-orm"
import { afterAll, beforeEach } from "vitest"
import { db, pool } from "../../src/db"

// Wipe every app + auth table between tests. TRUNCATE ... CASCADE clears the
// child tables (drink_countries, tastings, sessions, accounts) via the FKs.
// "brands" is listed explicitly because "drinks" references it with onDelete
// restrict, so truncating drinks does not cascade to brands (and vice versa).
// RESTART IDENTITY keeps sequences deterministic.
export const resetDb = async () => {
  await db.execute(
    sql`TRUNCATE TABLE "drinks", "brands", "countries", "users" RESTART IDENTITY CASCADE`,
  )
}

// Register the standard integration lifecycle: a clean DB before each test and
// a closed pool once the file is done (so the worker process can exit cleanly).
export const useTestDb = () => {
  beforeEach(resetDb)

  afterAll(async () => {
    await pool.end()
  })
}

export { db }
