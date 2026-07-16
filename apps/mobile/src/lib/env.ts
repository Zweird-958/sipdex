import { z } from "zod"

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url().default("http://localhost:3000"),
})

// Expo inlines `process.env.EXPO_PUBLIC_*` at build time. Typing it as unknown
// keeps validation independent of ambient `process` typings, which are absent
// in CI (expo-env.d.ts is generated locally and gitignored).
const apiUrl: unknown = process.env.EXPO_PUBLIC_API_URL

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: apiUrl,
})
