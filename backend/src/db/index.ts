import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "../env"
import * as schema from "./schema"

if (env.IS_TEST && !env.DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST is required when running in test mode")
}

const connectionString = env.IS_TEST ? env.DATABASE_URL_TEST : env.DATABASE_URL

export const pool = new Pool({ connectionString })

export const db = drizzle(pool, { schema })
