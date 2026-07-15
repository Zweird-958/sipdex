import { sql } from "drizzle-orm"
import { afterAll, beforeEach } from "vitest"
import { db, pool } from "../../src/db"

// Wipe every app + auth table between tests. TRUNCATE ... CASCADE clears the
// child tables (fanta_countries, tastings, sessions, accounts) via the FKs, so
// only the roots need listing. RESTART IDENTITY keeps sequences deterministic.
export const resetDb = async () => {
  await db.execute(
    sql`TRUNCATE TABLE "fanta", "countries", "users" RESTART IDENTITY CASCADE`,
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
