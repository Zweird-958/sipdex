/* eslint-disable no-console */
import { reset as drizzleReset } from "drizzle-seed"
import { db } from "../src/db"
import * as schema from "../src/db/schema"

const reset = async () => {
  console.log("Resetting database...")

  await drizzleReset(db, schema)

  await db.$client.end()
}

void reset()
