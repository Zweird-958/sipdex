import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "test"
        ? process.env.DATABASE_URL_TEST!
        : process.env.DATABASE_URL!,
  },
})
