import { reset as drizzleReset } from "drizzle-seed"
import { db } from "../src/db"
import * as schema from "../src/db/schema"
import { logger } from "../src/lib/logger/logger"

const reset = async () => {
  logger.info("Resetting database...")

  await drizzleReset(db, schema)

  await db.$client.end()
}

void reset()
