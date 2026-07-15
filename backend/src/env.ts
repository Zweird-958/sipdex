/* eslint-disable no-console */
import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  BASE_URL: z.url().default("http://localhost:3000"),
  IS_TEST: z.coerce.boolean().default(false),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_TEST: z.string().optional(),

  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  TRUSTED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),

  S3_URL: z.url(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_PUBLIC_URL: z.string().endsWith("/"),
})

const parsed = envSchema.safeParse({
  ...process.env,
  IS_TEST: process.env.NODE_ENV === "test",
})

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:")
  console.error(z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
