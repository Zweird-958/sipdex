import { config } from "dotenv"

// Vitest/Vite injects a reserved BASE_URL="/" into process.env, which fails the
// z.url() check in src/env.ts. Drop it so dotenv can load the real value below.
if (process.env.BASE_URL === "/") {
  delete process.env.BASE_URL
}

// Load .env first so real local values win, then fill any gaps with safe
// fallbacks so src/env.ts still parses in environments without a .env (e.g. CI).
config()

process.env.NODE_ENV = "test"

const defaults: Record<string, string> = {
  BASE_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://sipdex:sipdex@localhost:5439/sipdex",
  DATABASE_URL_TEST: "postgresql://sipdex:sipdex@localhost:5440/sipdex_test",
  BETTER_AUTH_SECRET: "test-secret",
  MOBILE_ORIGIN: "mobile://",
  S3_URL: "http://localhost:9000",
  S3_BUCKET_NAME: "test-bucket",
  S3_ACCESS_KEY_ID: "test-access-key",
  S3_SECRET_ACCESS_KEY: "test-secret-key",
  S3_PUBLIC_URL: "http://localhost:9000/test-bucket/",
}

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value
}
