import { config } from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

// Runs once, in the main process, before any integration test worker starts.
// It is intentionally self-contained (its own pool, no src/db import) so it does
// not depend on the per-worker env wiring in setup-env.ts.
export default async function setup() {
  config()

  const connectionString = process.env.DATABASE_URL_TEST

  const pool = new Pool({ connectionString })
  const db = drizzle(pool)

  // Idempotent: drizzle skips migrations already recorded in its journal, so
  // running the suite standalone (`vitest`) works even without the npm script.
  await migrate(db, { migrationsFolder: "./drizzle" })

  await pool.end()
}
